# Nuven Bot: activation record

## Implemented

- Public browser key scoped by Supabase RLS; no service key in client code.
- Email/password account UI, confirmation redirect to https://www.nuvembot.net/conta and sign-out.
- Separate cloud projects, append-only imports, JSON exports and authorized email sharing.
- Realtime item subscription plus explicit refresh; conditional updates detect concurrent edits.
- Browser PDF/TXT text extraction. No OCR, encrypted-PDF support or DOCX support is claimed.
- Private server quota: two successful idea analyses and one short document analysis per confirmed account. The short-document cap is three pages and 6,000 characters.
- Quote registration in the authenticated account; users cannot approve their own quotes or mark them paid.
- Authenticated AI/checkout function and Stripe-signature-verified webhook deployed.

## Activation required before commercial use

The AI and payment switches default to off. No paid plan, API consumption or checkout was activated during this implementation.

1. In Supabase Auth, confirm Email/password is enabled, Site URL is https://www.nuvembot.net and https://www.nuvembot.net/conta is allowed as a redirect. Configure a production email sender and verify signup, confirmation and recovery with a real consenting tester. These Auth settings cannot be changed with the connected tools.
2. For DeepSeek, set NUVEN_AI_PROVIDER=deepseek and DEEPSEEK_API_KEY in Supabase Edge Function secrets. The model is fixed to deepseek-flash, thinking is disabled and output is capped at 700 tokens. Existing OpenAI configuration remains the default when NUVEN_AI_PROVIDER is absent; it uses OPENAI_API_KEY and NUVEN_AI_MODEL. Set NUVEN_AI_ENABLED=true only after configuring the provider and reviewing usage costs. Keys belong in Supabase Edge Function secrets, never the repository or browser. The Vercel server-function package prepared separately on 21/10 is not this current architecture.
3. Connect a verified Stripe receiving account, set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET, register https://vqcimzjyhpvdwsvronxw.supabase.co/functions/v1/nuven-stripe-webhook for checkout.session.completed and checkout.session.async_payment_succeeded. Run sandbox checkout, signature rejection and duplicate-event tests before setting NUVEN_PAYMENTS_ENABLED=true with production credentials.
4. Paid checkout is limited to approved simple requests (R$100 per service). Customized document and business work require a reviewed final quote and delivery process; the R$800 amount remains a starting estimate.
5. Decide retention, privacy terms, service terms and delivery/support procedures before accepting personal or confidential client documents.

## Validation boundaries

Real database transaction tests exercise owner/member access, stranger isolation, quota limits and restricted refund privileges; all fixtures are rolled back. Browser tests use explicitly mocked auth/data responses for UI behavior and cannot prove email delivery, end-to-end signup, provider billing, actual AI results or live multiuser websocket delivery. Provider credentials and a real consented account are required for those final validations.

Local board storage nuven-bot:quadro:v1 is not read or copied by cloud login. Copying happens only when the user explicitly imports a backup.
