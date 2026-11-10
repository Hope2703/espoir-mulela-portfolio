# Contenu et administration

## Source réelle migrée

Le jeu initial contient neuf projets, dont CulinaPOS, WhatsApp Sender / Whasend, MaliyaFlow, le projet institutionnel confidentiel (`projet-institutionnel`), Axum, Libiki Lya Kongo, Esikanayo, AgriculturePourTous et THE AGENCY DRC. Il contient aussi quatre expériences, trois formations, deux certifications, quatre catégories de compétences et la fiche bilingue de la formation Kadea Academy. Le seed ne crée aucune publication.

THE AGENCY DRC utilise le slug commun the-agency-drc et deux captures réelles de l’accueil et de la recherche de biens sur https://theagency.axumindustries.com/. L’association à Axum est confirmée par le propriétaire. La fiche décrit uniquement les contrôles publics observés : aucun rôle personnel, technologie, volume commercial ou fonctionnalité privée n’est inventé. Les résultats immobiliers étaient vides lors de l’inspection.

Le seed copie le portrait et les captures des projets publics de `public/images` vers `storage/app/public/images`. La capture historique du projet confidentiel a été retirée des sources publiques. Les installations existantes peuvent encore avoir une copie historique sur le disque public et une référence en base. Après validation de la livraison, déplacer cette copie vers un stockage privé et vérifier que les deux anciennes URL répondent 404. Le contrôle Laravel refuse ces URL, y compris lorsque la référence en base est absente. Les tests vérifient aussi les empreintes des médias publics.

Le projet institutionnel affiche le titre, le sous-titre et la description anonymisés de `lang/{fr,en}/confidential.php`. La fiche et le SEO utilisent ces mêmes traductions. La confidentialité de cette fiche est verrouillée dans l’éditeur et reste active avec un ancien indicateur désactivé. L’éditeur privé conserve les champs historiques. Le serveur bloque l’association de nouvelles captures et l’accès direct aux médias associés à un projet confidentiel.

Les expériences proposent « Détails confidentiels » et « Responsabilités publiques » FR/EN. Lorsque la protection est active, l’organisation, le rôle et la période restent visibles avec les responsabilités publiques. Taprinella utilise le texte bilingue validé lorsque la valeur enregistrée est absente ou différente. Les anciennes descriptions et contributions restent privées. Les champs publics protégés de cette entrée sont en lecture seule dans l’éditeur. `php artisan portfolio:protect-taprinella` enregistre la copie publique et rétablit l’indicateur de confidentialité pour cette seule entrée.

Le seed initialise les nouvelles installations. `php artisan portfolio:refresh-editorial` applique les textes validés aux fiches existantes du parcours, à la certification Duolingo et à la catégorie IA & Data. La fiche Kadea partage son titre et son résumé avec la formation d’amorçage. La commande préserve les slugs, dates, médias et statuts des activités existantes ainsi que la description française déjà actualisée. Les langues parlées apparaissent séparément des formations et certifications complémentaires. Les compétences restent administrables et distinguent la pratique de l’apprentissage.

## Modifier les contenus

Créer son administrateur avec php artisan admin:create ou, après configuration locale explicite de ADMIN_EMAIL/ADMIN_PASSWORD, php artisan db:seed --class=AdminUserSeeder, puis ouvrir /login et /admin. Les formulaires projets, activités et publications proposent Français/English, statut draft/published/archived, dates, slug, résumé et contenu ; ordre/SEO pour projets et publications. La langue d’interface est indépendante de l’onglet éditorial et préserve les saisies. /admin/profile gère nom, email et mot de passe ; le mot de passe actuel est requis pour une modification sensible. Les projets portent description Markdown, contexte/rôle optionnels, un lien public, mise en avant et confidentialité. Aucun champ technologies, catégorie, dépôt ou éditeur de sections. Les activités portent résumé, description optionnelle, type simple, rôle/lieu optionnels et date d’événement ; les publications utilisent du Markdown avec prévisualisation HTML assainie. Aucun MDX exécutable n’est accepté.

Enregistrer les deux traductions avant publication. Un contenu futur reste invisible jusqu’à sa date ; une archive ou suppression disparaît du public et du sitemap. Preview est privé. Les slugs de chaque langue doivent être uniques, y compris parmi les contenus supprimés, pour ne pas réattribuer accidentellement une ancienne adresse.

Le lien public existant apparaît avant les captures sur la fiche projet. Il peut aussi recevoir l’URL d’un dépôt GitHub public : le libellé FR/EN devient alors « Consulter le dépôt GitHub » / « View GitHub repository ». Aucun dépôt n’est ajouté automatiquement et ce champ unique ne stocke pas simultanément site et dépôt. Les projets confidentiels restent sans lien public. La section « Le contexte du projet. » / « Project context. » présente les champs contexte et description existants ; aucune donnée éditoriale n’est réécrite.

Le parcours et les compétences se modifient dans les modules dédiés. Une catégorie contenant des compétences ne peut pas être supprimée avant réaffectation ou suppression de ses enfants. Les paramètres administrent seulement nom complet, titre professionnel FR/EN, bio FR/EN, localisation FR/EN, SEO FR/EN, email et WhatsApp. L’accueil compose automatiquement le résumé à partir du parcours ; sa mise en page reste dans le code. Les compétences ont catégorie, nom, ordre et visibilité. Les données éditoriales ne doivent pas être recopiées dans les composants React.

## Médias

Depuis chaque fiche enregistrée, Gérer les médias associe JPEG/PNG/WebP à un projet, une activité, une couverture de publication ou au portrait. Maximum 8 Mo, dimensions comprises entre 100 et 6000 pixels ; SVG et formats non autorisés sont refusés. Renseigner les textes alternatifs FR/EN, ordre et type cover/desktop/mobile/other. La photographie est accessible depuis Paramètres. Les noms sont générés côté serveur. La suppression d’un média de contenu publié est bloquée : remettre le contenu en brouillon avant cette opération. Les fichiers référencés ailleurs sont préservés.

MaliyaFlow conserve ses captures sans légende. Les pages utilisent la couverture puis les captures en fonction de la composition existante ; pas de contenu factice pour remplir les états vides.

## Réseaux, messages et paramètres

Les adresses WhatsApp, LinkedIn et email sont les données réelles déjà présentes. Réseaux possède uniquement plateforme, URL, actif et ordre ; le libellé public est dérivé de l’adresse email/WhatsApp ou de la plateforme. Instagram est désactivé et vide ; l’activer seulement avec l’adresse réelle. Chaque plateforme valide sa forme d’URL. Les paramètres email/WhatsApp mettent également à jour leurs liens sociaux.

Les messages peuvent être lus, marqués lus/non lus, archivés/restaurés et supprimés logiquement. Aucun envoi de réponse automatique n’est effectué depuis le dashboard. Les statistiques reflètent seulement les visites enregistrées.

## Seeders et données manquantes

php artisan db:seed importe les données initiales de façon idempotente sans remplacer les éditions ni ressusciter un projet ou une activité supprimés. Il ne crée aucun administrateur, aucune publication et aucune donnée de démonstration.

À configurer pour la production : domaine canonique espoir.axumindustries.com, accès VPS et PostgreSQL, compte admin personnel, destinataire des notifications, fournisseur SMTP et expéditeur vérifié. The Agency utilise actuellement https://theagency.axumindustries.com/ ; aucune mention de domaine temporaire ou disclaimer public. À confirmer : URL Instagram et futurs contenus réels. Le seed ne transforme pas une donnée absente en fait inventé.
