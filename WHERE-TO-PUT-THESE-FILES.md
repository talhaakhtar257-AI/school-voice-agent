# Where each file goes

Do this after `sp init school-voice-agent --ai claude`, inside the project folder.

## The four files I made you

| File I gave you | Rename and put it here |
|---|---|
| `CLAUDE.md` | `CLAUDE.md` (project root) |
| `rules-api.md` | `.claude/rules/api.md` |
| `rules-frontend.md` | `.claude/rules/frontend.md` |
| `rules-database.md` | `.claude/rules/database.md` |

Create the folder first if it does not exist:

```bash
mkdir -p .claude/rules
```

**Check it worked:** start Claude Code in the project folder and run `/context`.
Your `CLAUDE.md` should appear under **Memory files**. If it does not, Claude
cannot see it and none of these rules apply.

## Why the rules are in separate files

`CLAUDE.md` loads into every session and costs context on every message. The
rules files carry `paths:` frontmatter, so they load only when Claude touches
matching files. Database rules stay out of the way while you build the landing
page.

That is how you keep `CLAUDE.md` short without losing detail.

---

## Two more files to create yourself

### 1. `CLAUDE.local.md` — your private notes

Project root. Not shared, not committed. Put your own working details here.

```markdown
# Local notes

## My setup
- Windows / Mac: FILL THIS IN
- Node version: FILL THIS IN

## My URLs
- Local: http://localhost:3000
- Vercel preview: FILL THIS IN
- Supabase project: FILL THIS IN

## Retell settings that work
- Voice: Monica (Indian) — best Urdu pronunciation
- Silence timeout: 3 seconds
- Language: multilingual

## Test data I use
- Parent: Ahmed Khan
- Student: Ali Ahmed, class 6, age 11
- Phone: 03001234567
```

Add it to `.gitignore`.

### 2. `.env.local` — your secrets

Never committed. Never pasted into chat. Create `.env.example` with empty values
so you remember what is needed, and keep the real values in `.env.local`.

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RETELL_WEBHOOK_SECRET=
NEXT_PUBLIC_RETELL_AGENT_ID=
```

---

## Add to `.gitignore`

```
.env
.env.local
.env*.local
CLAUDE.local.md
node_modules
.next
```

---

## The order to do everything

1. `sp init school-voice-agent --ai claude`
2. `cd school-voice-agent`
3. `mkdir -p .claude/rules`
4. Put the four files where the table says
5. Create `CLAUDE.local.md` and `.gitignore`
6. Open Claude Code
7. Run `/context` and confirm `CLAUDE.md` is listed
8. Run `/sp.constitution` and paste the constitution from your master guide
9. Start Feature 1

---

## Keeping CLAUDE.md healthy

**Add a line when:**

- Claude Code makes the same mistake twice
- You type the same correction you typed last session
- You explain the same thing again

**Remove a line when:**

- It contradicts another line — pick one, delete the other
- It describes something Claude can already see in the code
- It is about one feature that is now finished

**Keep it under 200 lines.** Longer files eat context and get followed less
reliably. When it grows past that, move a section into `.claude/rules/` with a
`paths:` header instead.

**Do not** paste your whole specification into `CLAUDE.md`. The specification
lives in `specs/`, and Spec Kit Plus loads it when it is needed.
