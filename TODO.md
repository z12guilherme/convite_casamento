# TODO: Project Organization

## Current Progress
- [x] Create directories: templates/, invites/, gifts/
- [x] Move templates: convidado.html, convidado_template.html to templates/
- [x] Move gift files: lista_presentes.html, dashboard.html to gifts/
- [x] Move confirm_present.php to gifts/
- [x] Move delete_present.php to gifts/
- [x] Move generated pages: dani.html, danieiron.html to invites/
- [x] Update paths in templates/convidado_template.html (CSS link, button href)
- [x] Recreate invites/ pages with updated paths

## Pending Steps
- [ ] Update php/add_guest.php: Change template path to '../templates/convidado_template.html', output dir to '../invites/', mkdir('../invites') if needed, update JSON path if necessary.
- [ ] Update php/delete_guest.php: Change file removal path to '../invites/{$nome}.html'.
- [ ] Update gifts/dashboard.html: Ensure fetch to '../data/presentes_confirmados.json', delete fetch to 'delete_present.php'.
- [ ] Update gifts/lista_presentes.html: Ensure confirm fetch to 'confirm_present.php'.
- [ ] Clean up: Remove old convites/, convites/convites/, convidados/, root copies of moved files (convidado.html, etc.), test.json.
- [ ] Test: Run PHP server, add guest (verify generation in invites/), access page (verify links/CSS), confirm gift from gifts/lista_presentes.html, delete from dashboard.html, verify updates.
