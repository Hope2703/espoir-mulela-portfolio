# Contenu et administration

## Source réelle migrée

Neuf projets : CulinaPOS, WhatsApp Sender / Whasend, MaliyaFlow, FOMIN (slug projet-institutionnel), Axum, Libiki Lya Kongo, Esikanayo, AgriculturePourTous et THE AGENCY DRC. Quatre expériences, trois formations, deux certifications et quatre catégories de compétences sont reprises du profil initial, avec leurs traductions et outils réels. Activités et publications restent vides.

THE AGENCY DRC utilise le slug commun the-agency-drc et deux captures réelles de l’accueil et de la recherche de biens sur https://theagency.axumindustries.com/. L’association à Axum est confirmée par le propriétaire. La fiche décrit uniquement les contrôles publics observés : aucun rôle personnel, technologie, volume commercial ou fonctionnalité privée n’est inventé. Les résultats immobiliers étaient vides lors de l’inspection.

Le portrait et les captures de l’import initial sont copiés sans transformation dans storage/app/public/images. Les fichiers d’origine dans public/images restent conservés. La capture historique du projet confidentiel et son marqueur public_safe restent en base et sur disque pour préserver les données, mais ne sont plus diffusés. Les tests vérifient les empreintes SHA-256 et le refus des URL directes confidentielles. Deux images OpenGraph PNG FR/EN complètent ces assets.

Le projet institutionnel reste une contribution chez Taprinella Logistic avec une présentation publique neutre. Aucun accès, URL interne, IP, montant, identifiant, nom de client ou détail métier confidentiel ne doit être diffusé. Un projet confidentiel affiche les libellés neutres Laravel ; ses textes éditoriaux et champs SEO spécifiques restent privés. Le serveur bloque aussi l’association de nouvelles captures et l’accès direct aux médias déjà enregistrés. Ne pas effacer les anciennes données pour les rendre privées.

Les expériences proposent « Détails confidentiels » et « Responsabilités publiques » FR/EN. Lorsque la protection est active, organisation, rôle et période restent visibles ; seuls le nouveau champ public bilingue ou un message neutre sont affichés. L’ancienne description et les contributions sont conservées dans l’éditeur privé. Taprinella est protégée tant que le nouvel indicateur n’a pas été explicitement choisi. Une désactivation rendrait de nouveau publics les anciens détails : ne la faire qu’après revue éditoriale. Toute responsabilité publique renseignée doit exister dans les deux langues et rester générale, sans identifier le projet ni son client.

Les nouveaux textes de projets, expériences, Kadea et compétences validés en revue doivent être saisis manuellement dans les entrées existantes du dashboard. Cette évolution de code ne les importe pas et ne lance aucun seeder. Conserver les titres Axum actuels, les slugs, dates, médias et statuts ; le statut éditorial Publié ne signifie pas que le produit est terminé. Les quatre catégories de compétences restent administrables ; distinguer pratique professionnelle et apprentissage dans leurs descriptions, sans pourcentage de maîtrise.

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

php artisan db:seed importe les données initiales de façon idempotente sans remplacer les éditions ni ressusciter un projet supprimé. Aucun administrateur, activité, publication, métrique ou client de démonstration n’est créé.

À configurer pour la production : domaine canonique espoir.axumindustries.com, accès VPS et PostgreSQL, compte admin personnel, destinataire des notifications, fournisseur SMTP et expéditeur vérifié. The Agency utilise actuellement https://theagency.axumindustries.com/ ; aucune mention de domaine temporaire ou disclaimer public. À confirmer : URL Instagram et futurs contenus réels. Le seed ne transforme pas une donnée absente en fait inventé.
