const DB_SERVER = "server";
const DB_GHOST = "ghost";
const DB_HOST = "host";

APIScheme = {
//"PATH": [HTTP_METHODS, PARAMS, CALLBACK_FUNCTION],
  "create": [["GET"], {server:0}, api_create],
  "config": [["GET"], {proxyid:1}, api_config],
  "put": [["GET"], {proxyid:1, type:1, name:0, data:0}, api_put],
  "get": [["GET"], {proxyid:1, type:1, name:0}, api_get],
  "delete": [["GET"], {proxyid:1, type:1, name:0}, api_delete],
  "list": [["GET"], {proxyid:1, type:1}, api_list]
}

addEventListener("fetch", (event) => {
  event.respondWith(
    handleWithCORS(event)
  );
});

async function handleWithCORS(event) {
  let res=await handleAPI(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    );
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}

async function handleAPI(request) {
  const url = new URL(request.url);
  const [ ,command ] = url.pathname.split("/");

  if(!(command in APIScheme)) {
    let server = await DB.get([DB_SERVER, command]);
    if (server === null) {
      return new Response("Not Found", {status: 404});
    }
    return await handleDNS(request, url, command, server);
  }
  const [methods, params, fn] = APIScheme[command];
  if(methods.indexOf(request.method) == -1) {
    return new Response("Method Not Allowed", {status: 405, headers: {"Accept": methods.join(", ")}});
  }
  if(request.method == "GET") {
    for(param in params) {
      if(!url.searchParams.has(param)) {
        return new Response("Bad Request", {status: 400});
      }
    }
    if(params.proxyid) {
      let server = await DB.get([DB_SERVER, url.searchParams.get("proxyid")]);
      if(server === null) {
        return new Response("Unauthorized", {status: 401})
      }
      url.searchParams.set("server", server);
    }
    if(params.type) {
      let type = url.searchParams.get("type");
      if(type != 1 && type !=28)
        return new Response("Bad Request", {status: 400})
    }
  }

  return await fn(url.searchParams);
}

async function api_create(params) {
  let server = params.get("server");
  if(!server.trim()) {
    server=DEFAULT_SERVER;
  }
  let uuid = crypto.randomUUID();
  await DB.put([DB_SERVER, uuid], server, {metadata: uuid, expirationTtl: PROXY_TTL})
  await DB.put([DB_GHOST, uuid], Date.now(), {metadata: uuid});
  return new Response(uuid);
}

async function api_config(params) {
  let server = params.get("server");
  return new Response(server);
}

async function api_put(params) {
  await DB.put([DB_HOST, params.get("proxyid"), params.get("type"), params.get("name")], params.get("data"));
  return new Response(params.get("name"));
}

async function api_get(params) {
  let data = await DB.get([DB_HOST, params.get("proxyid"), params.get("type"), params.get("name")]);
  if(data === null) data="";
  return new Response(data);
}

async function api_delete(params) {
  await DB.delete([DB_HOST, params.get("proxyid"), params.get("type"), params.get("name")]);
  return new Response("OK");
}

async function api_list(params) {
  let list = await DB.list({"prefix": [DB_HOST, params.get("proxyid"), params.get("type")]});
  return new Response(JSON.stringify(list.keys));
}

async function handleDNS(request, url, proxyid, server) {
  if(request.method == "GET") {
    const modifiedRequest = new Request(server+url.search, request);
    let response = await fetch(modifiedRequest);
    let json = await response.json();
    if(json.Answer)
    for(const x of json.Answer) {
      let data = await DB.get([DB_HOST, proxyid, x.type, x.name]);
      if(data) x.data=data;
    }
    response = new Response(JSON.stringify(json), response);
    await DB.put([DB_SERVER, proxyid], server, {metadata: proxyid, expirationTtl: PROXY_TTL});
    return response;
  }else if(request.method == "POST") {
    return new Response("Not Implemented", {status: 501});
  }else{
    return new Response("Method Not Allowed", {status: 405});
  }
}

addEventListener("scheduled", event => {
  event.waitUntil(handleCleanup(event))
})

async function handleCleanup(event) {
  let ghostsList = await DB.list({"prefix": DB_GHOST});
  let ghosts = {};
  for(x of ghostsList.keys) {
    ghosts[x.metadata] = true;
  };
  let proxiesList = await DB.list({"prefix": DB_SERVER});
  for(x of proxiesList.keys) {
    console.log(x.metadata);
    delete ghosts[x.metadata];
  };
  for(ghost in ghosts) {
    let hostsList = await DB.list({"prefix": [DB_HOST, ghost]});
    for (x of hostsList.keys) {
      await DB.delete(x.name);
    };
    await DB.delete([DB_GHOST, ghost]);
  };
}