# KAPOR Clothing Store — Deploy Guide (Phone diye)

Ei guide follow korlei tor store GitHub → Vercel e live hobe. Sob step phone thekei hobe, Termux lagbe code push korte.

---

## Step 1: Supabase Project Bana

1. supabase.com e ja, nijer Google account diye login kor
2. **New Project** → name de `kapor-store` → ekta strong database password de (note kore rakh) → Region: **Singapore** select kor → Create
3. Project ready hoite 2-3 minute lagte pare, wait kor
4. Left menu → **SQL Editor** → New query
5. GitHub repo theke `supabase/migration-001.sql` file ta khul, **puro file copy** kore SQL editor e paste kor → **Run** chap
6. "Success" dekhle tables, security (RLS) ar 12 ta sample product ready ✅
   - File er prothom line ta `--` comment, tai phone paste e prothom line ulta-palta hoileo kichu hobe na

Erpor 2 ta key lagbe (pore Vercel e dibi):
- Supabase → Settings → API → **Project URL** (eta holo NEXT_PUBLIC_SUPABASE_URL)
- Oi page ei **anon public key** (eta holo NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ⚠️ `service_role` key ta KOKHONO website e dibi na, kaoke dibi na

---

## Step 2: Admin User Bana (Supabase Auth)

1. Supabase → **Authentication** → **Users** → **Add user**
2. Nije ekta email + password de, **Auto Confirm User** tick de → Create
3. User list theke user ta tap kore tar **UID** copy kor
4. SQL Editor e giye ei line ta run kor — shudhu `YOUR-USER-UID` er jaygay tor copy kora UID bosha:

```sql
insert into public.profiles (id, role) values ('YOUR-USER-UID', 'admin')
on conflict (id) do update set role = 'admin';
```

5. Hoy gelo — ei email/password diyei website er `/login` page theke admin panel e dhukbi

---

## Step 3: GitHub Repo + Termux Push

1. github.com → **New repository** → name de `clothing-store` → **Public** → Create (kono README tick dis na)
2. Termux khul, GitHub theke code namanor jonno prothome nijer PC/Termux e ei folder ta ante hobe (jekhan theke code paisos shei jayga theke `clothing-store` folder ta Termux er storage e ne)
3. Termux e ekta ekta kore line chap (⚠️ 2 ta command ek line e `&&` diye jora dibi NA — age ekbar git push miss hoisilo ei jonno):

```bash
cd clothing-store
git init
git branch -M main
git add .
git status
```

`git status` e sob file list e ache kina dekhe ne — kichu file miss gele oi file ta abar add kor:

```bash
git commit -m "KAPOR clothing store first version"
git remote add origin https://github.com/TOR-USERNAME/clothing-store.git
git push -u origin main
```

- `TOR-USERNAME` er jaygay tor nijer GitHub username bosha
- Push er somoy GitHub password chaile password na, **Personal Access Token** lagbe (GitHub → Settings → Developer settings → Personal access tokens theke bana)

Porer bar update push korte shudhu:

```bash
git add .
git commit -m "update"
git push
```

---

## Step 4: Vercel e Deploy

1. vercel.com → login with GitHub → **Add New → Project**
2. `clothing-store` repo ta **Import** kor
3. Deploy chap dewar AGE **Environment Variables** khul — 2 ta variable add kor:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` → Value: Step 1 er Project URL
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: Step 1 er anon public key
   - ⚠️ Type obosshoi **Config / Plain Text** select korbi — **Secret type select korle phone e Save button kaj kore na** (mess-khojo te ei problem hoisilo)
4. **Deploy** chap de → 2-3 minute e live link pabi, jemon `clothing-store.vercel.app`

Env var pore bodlate hoile: Vercel → Project → Settings → Environment Variables e bodla, tarpor **Deployments → latest → Redeploy** (NEXT_PUBLIC_ variable build er somoy dhuke jay, tai redeploy chara kaj korbe na)

---

## Step 5: Live Test Checklist ✅

Deploy er por phone diye ekta ekta check kor:

- [ ] Homepage khule — hero banner ghure, product dekhay (Supabase connect hoar ageo sample product dekhabe, blank asbe na)
- [ ] Product e tap → size select → **Add to Cart** → cart total bar-e BDT update hoy
- [ ] Checkout: nijer name, phone (01 diye shuru 11 digit), address diye **COD** order de
- [ ] **Track Order** page e giye oi phone number diye order ta khuje paoa jay kina
- [ ] `/login` page e admin email/password diye login → `/admin` panel khule
- [ ] Admin → **Settings** tab: dokaner asol naam, **nijer bKash/Nagad number**, delivery charge bosha → Save
- [ ] Admin → **Products** tab: sample product gula edit kore tor asol product, chobi, daam bosha (chobi upload o hobe, othoba chobir link paste korlei hobe)
- [ ] Admin → **Orders** tab e test order ta **Confirmed → Delivered** kore dekh — Dashboard revenue update hobe

---

## Problem Hoile

| Problem | Solution |
|---|---|
| Login e "Invalid path specified" error | Vercel env e NEXT_PUBLIC_SUPABASE_URL vul project er URL geche. Sothik project er URL bosha → Redeploy |
| Site khali / product ashe na | Migration SQL run hoise kina check kor (Table Editor e `products` table). Env var 2 ta thik ache kina dekh, tarpor Redeploy |
| Admin panel e dhukle home page e ferot pathay | Profiles table e tor UID er role `admin` hoise kina check kor (Step 2 er SQL) |
| Push hoise kintu GitHub e file nai | Phone storage e `git add` maje maje file miss kore. GitHub web e file list check kor, miss thaka file ta abar add + commit + push kor |
| Vercel e ager version dekhay | Deployments → shesh **Ready** deployment ta → **Promote to Production** |

Admin panel: `tor-site.vercel.app/admin` • Login: `tor-site.vercel.app/login`
