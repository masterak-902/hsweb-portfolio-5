# 🔥の目的！
`Zenn`, `Note`, etc... のRSSデータをJSONに形成して、GETリクエストに対してRSS_JSONを返すだけ！

## キャッシュ周りの動作について

`CloudFlare KV`を使用してISRを実現する。
キャッシュの有効期間は、`3600[s]`にして管理！
 
# セットアップ
```sh
git clone https://github.com/masterak-902/hsweb-portfolio-5.git

cd hsweb-portfolio-5
touch wrangler.toml
```

```toml
name = "hsweb-portfolio-5"
compatibility_date = "2024-09-05"
# compatibility_flags = [ "nodejs_compat" ]

[vars]
MY_VAR = "my-variable"

[[kv_namespaces]]
binding = "MY_KV_NAMESPACE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```


```sh
bun install
bun run dev

npx wrangler kv create MY_KV_NAMESPACE
```

# CloudFlareにアップロード 
```
bun run deploy
```

