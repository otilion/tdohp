#Setup
* Install and configure `wrangler`
* Generate new KV namespace with `wrangler kv:namespace create "DB"`
* Replace the old KV ID with the newly generated one in `wrangler.toml`, but keep the same binding: `binding = "DB"`
* Run `wrangler publish`