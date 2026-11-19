# TorreOnCall – webbplats

Statisk webbplats (HTML, CSS och JavaScript) utan byggsteg eller beroenden.

## Filer
- `index.html` – allt innehåll
- `styles.css` – design, färger och animationer
- `script.js` – interaktion (tema, meny, animationer, planerare, formulär)
- `assets/` – logotyp och favicon
- `.nojekyll` – gör att GitHub Pages serverar filerna som de är

## Publicera med GitHub Pages
1. Skapa ett nytt repo på GitHub, t.ex. `torreoncall-site`.
2. Ladda upp alla filer i mappen (inklusive `.nojekyll`) till repots rot.
3. Gå till **Settings → Pages**, välj **Deploy from a branch**, branch `main`, mapp `/ (root)`, och spara.
4. Efter någon minut ligger sidan på `https://<användarnamn>.github.io/torreoncall-site/`.

### Egen domän (torreoncall.se)
1. Under **Settings → Pages → Custom domain**, skriv `torreoncall.se` och spara (en `CNAME`-fil skapas automatiskt).
2. Hos er domänleverantör: lägg A-poster för `@` mot
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   och en CNAME-post för `www` mot `<användarnamn>.github.io`.
3. Kryssa i **Enforce HTTPS** när certifikatet är klart.

## Kontaktformuläret
Som standard öppnar formuläret besökarens e-postprogram med meddelandet ifyllt (till `info@torreoncall.se`).
Vill ni att formuläret skickas direkt från sidan: skapa ett gratis formulär hos t.ex. Formspree och klistra in adressen i
`script.js` på raden `const FORM_ENDPOINT = "";`.

## Ändra innehåll
- Texter: redigera direkt i `index.html`.
- Färger: variablerna överst i `styles.css` (`--navy`, `--blue` m.fl.).
- E-post: `CONTACT_EMAIL` överst i `script.js`.

Sidan respekterar systeminställningen för minskad rörelse och mörkt läge, och fungerar med tangentbord.
