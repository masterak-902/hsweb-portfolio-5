# 🔥の目的！
`Zenn`, `Note`, etc... のRSSデータをJSONに形成して、GETリクエストに対してRSS_JSONを返すだけ！

## キャッシュ周りの動作について

`CloudFlare KV`を使用してISRを実現する。
キャッシュの有効期間は、`3600[s]`にして、有効期限の管理はCronにて管理。
 
# セットアップ
```
bun install
bun run dev
```

# CloudFlareにアップロード 
```
bun run deploy
```
### wrangler.toml デフォルト設定

```sh
touch wrangler.toml
```

```toml
name = "hsweb-portfolio-5"
compatibility_date = "2024-09-05"
# compatibility_flags = [ "nodejs_compat" ]

# [vars]
# MY_VAR = "my-variable"

# [[kv_namespaces]]
# binding = "MY_KV_NAMESPACE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# [[r2_buckets]]
# binding = "MY_BUCKET"
# bucket_name = "my-bucket"

# [[d1_databases]]
# binding = "DB"
# database_name = "my-database"
# database_id = ""

# [ai]
# binding = "AI"
```
