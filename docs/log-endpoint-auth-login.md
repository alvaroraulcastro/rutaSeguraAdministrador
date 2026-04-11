2026-04-11 02:04:39.078 [info] [v1] / status=200
2026-04-11 02:04:39.417 [info] [auth.login.start] {
  requestId: '1f4999df-3eb0-4250-a064-5a547906b0fe',
  email: 'j***@example.com',
  origin: null
}
2026-04-11 02:04:39.628 [error] (node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
2026-04-11 02:04:40.519 [warning] [auth.login.invalid_credentials] {
  requestId: '1f4999df-3eb0-4250-a064-5a547906b0fe',
  email: 'j***@example.com'
}