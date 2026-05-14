export default {
  "added-artistic-team": {
    subject:
      "CooProg - Vous avez été ajouté à l'équipe artistique de {{project.title}}",
    raw: `
Bonjour,

Vous avez été ajouté à l'équipe artistique de {{project.title}} par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}}.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Pour accéder à CooProg en tant que membre de l'équipe artistique, merci de vous connecter à CooProg.
{{#if tour}}
Lien direct de la tournée : https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}
{{else}}
Lien direct du projet : https://cooprog.eu/projects/{{project._id}}
{{/if}}

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.
  `,
    html: `
<p>Bonjour,</p>

<p>Vous avez été ajouté à l'équipe artistique de {{project.title}} par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Pour accéder à CooProg en tant que membre de l'équipe artistique, merci de vous connecter à CooProg.</p>
{{#if tour}}
<p>Lien direct de la tournée : <a href="https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}">https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}</a></p>
{{else}}
<p>Lien direct du projet : <a href="https://cooprog.eu/projects/{{project._id}}">https://cooprog.eu/projects/{{project._id}}</a></p>
{{/if}}

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>
  `,
  },
  "added-diffusion-structure": {
    subject: "CooProg - Vous avez été ajouté à la tournée de {{project.title}}",
    raw: `
Bonjour,

Vous avez été ajouté à la tournée de {{project.title}} par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}}.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Pour accéder à CooProg en tant que membre de la tournée, merci de vous connecter à CooProg.
{{#if tour}}
Lien direct de la tournée : https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}
{{else}}
Lien direct du projet : https://cooprog.eu/projects/{{project._id}}
{{/if}}

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.
  `,
    html: `
<p>Bonjour,</p>

<p>Vous avez été ajouté à la tournée de {{project.title}} par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Pour accéder à CooProg en tant que membre de la tournée, merci de vous connecter à CooProg.</p>
{{#if tour}}
<p>Lien direct de la tournée : <a href="https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}">https://cooprog.eu/projects/{{project._id}}/tours/{{tour._id}}</a></p>
{{else}}
<p>Lien direct du projet : <a href="https://cooprog.eu/projects/{{project._id}}">https://cooprog.eu/projects/{{project._id}}</a></p>
{{/if}}

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>
  `,
  },
  "invite-artistic-team": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre le projet {{project.title}}",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a enregistré le spectacle « {{project.title}} » sur la plateforme CooProg.

En tant que membre de l'équipe artistique, vous êtes invité·e par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} à vous connecter à CooProg afin de compléter les informations liées au projet « {{project.title}} ».

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Vous pourrez notamment renseigner les éléments relatifs au spectacle et mettre à jour le calendrier.

Plus les données saisies sur CooProg sont précises et à jour, plus la plateforme gagne en pertinence et en utilité.

*CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.*

*CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.*

Pour accéder à CooProg en tant que membre de l'équipe artistique, merci de vous inscrire via le lien suivant : {{link}}.

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.

Bien cordialement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a enregistré le spectacle « {{project.title}} » sur la plateforme CooProg.</p>

<p>En tant que membre de l'équipe artistique, vous êtes invité·e par {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} à vous connecter à CooProg afin de compléter les informations liées au projet « {{project.title}} ».</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Vous pourrez notamment renseigner les éléments relatifs au spectacle et mettre à jour le calendrier.</p>

<p>Plus les données saisies sur CooProg sont précises et à jour, plus la plateforme gagne en pertinence et en utilité.</p>

<p><em>CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.</em></p>

<p><em>CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.</em></p>

<p>Pour accéder à CooProg en tant que membre de l'équipe artistique, merci de vous inscrire via le lien suivant : <a href="{{link}}">{{link}}</a>.</p>

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>

<p>Bien cordialement.</p>

<p>L'équipe CooProg</p>
    `,
  },
  "invite-diffusion-structure": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre le projet {{project.title}}",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à coordonner un projet de tournée sur la plateforme CooProg pour le spectacle "{{project.title}}".

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Pour cela, rejoignez CooProg et inscrivez-vous en cliquant sur le lien suivant : {{link}}.

*CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.*

*CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.*

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à coordonner un projet de tournée sur la plateforme CooProg pour le spectacle "{{project.title}}".</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Pour cela, rejoignez CooProg et inscrivez-vous en cliquant sur le lien suivant : <a href="{{link}}">{{link}}</a>.</p>

<p><em>CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.</em></p>

<p><em>CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.</em></p>

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>

<p>L'équipe CooProg</p>
    `,
  },
  "invite-schedule-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à participer à la tournée de {{project.title}}",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a indiqué que votre structure de programmation participe à la tournée de {{project.title}} le {{formatDate program.date 'fr'}}.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Pour vérifier, modifier ou compléter les dates de votre programmation, rejoignez CooProg et inscrivez-vous en cliquant sur le lien suivant : {{link}}.

*CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.*

*CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.*

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.

Bien cordialement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a indiqué que votre structure de programmation participe à la tournée de {{project.title}} le {{formatDate program.date 'fr'}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Pour vérifier, modifier ou compléter les dates de votre programmation, rejoignez CooProg et inscrivez-vous en cliquant sur le lien suivant : <a href="{{link}}">{{link}}</a>.</p>

<p><em>CooProg est une plateforme gratuite et collaborative de montage de tournée, accessible à l’ensemble des professionnels qui diffusent ou programment des œuvres relevant du spectacle vivant et/ou des musiques actuelles.</em></p>

<p><em>CooProg est piloté par l’Onda (Office national de diffusion artistique) et Zone Franche – le réseau des Musiques du Monde.</em></p>

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>

<p>Bien cordialement.</p>

<p>L'équipe CooProg</p>
    `,
  },
  "schedule-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous a positionné sur une nouvelle date pour la tournée de {{project.title}}",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a signalé que votre structure accueille une date de la tournée de {{project.title}} le {{formatDate program.date 'fr'}}.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

Pour vérifier, modifier ou compléter les informations liées à votre programmation, connectez-vous à CooProg.

Plus les données saisies sur CooProg sont précises et à jour, plus la plateforme gagne en pertinence et en utilité.

Merci d'avance pour votre contribution !

Bien cordialement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} a signalé que votre structure accueille une date de la tournée de {{project.title}} le {{formatDate program.date 'fr'}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>Pour vérifier, modifier ou compléter les informations liées à votre programmation, connectez-vous à CooProg.</p>

<p>Plus les données saisies sur CooProg sont précises et à jour, plus la plateforme gagne en pertinence et en utilité.</p>

<p>Merci d'avance pour votre contribution !</p>

<p>Bien cordialement.</p>

<p>L'équipe CooProg</p>
    `,
  },
  "weekly-dupes-admin": {
    subject: "CooProg - Résumé des doublons hebdomadaires",
    raw: `
  Cher Administrateur,
  
  Voici un résumé des projets identifiés comme doublons :
  
  {{#each dupes}}
  ---
  {{#each this}}
  {{this.artist}} - {{this.work}} - https://cooprog.eu/projects/{{this._id}}
  {{/each}}
  ---
  {{/each}}
    `,
    html: `
  <p>Cher Administrateur,</p>
  
  <p>Voici un résumé des projets identifiés comme doublons :</p>
  
  {{#each dupes}}
  <hr />
  {{#each this}}
  <p>
  <a href="https://cooprog.eu/projects/{{this._id}}">{{this.artist}} - {{this.work}}</a>
  </p>
  {{/each}}
  <hr />
  {{/each}}
  `,
  },
  "weekly-digest-admin": {
    subject: "CooProg - Récapitulatif hebdomadaire envoyé",
    raw: `
  Cher administrateur,
  
  Le récapitulatif hebdomadaire a été envoyé à {{count}} utilisateurs.
  
  {{#if errors.length}}
  Erreurs :
  {{#each errors}}
  {{this.email}} : {{this.error}}
  {{/each}}
  {{else}}
  Pas d'erreurs.
  {{/if}}
    `,
    html: `
  <p>Cher administrateur,</p>
  
  <p>Le récapitulatif hebdomadaire a été envoyé à {{count}} utilisateurs.</p>
  
  {{#if errors.length}}
  <p><u>Erreurs :</u></p>
  <ul>
  {{#each errors}}
  <li>{{this.email}} : {{this.error}}</li>
  {{/each}}
  </ul>
  {{else}}
  <p>Pas d'erreurs.</p>
  {{/if}}
    `,
  },
  "weekly-digest": {
    subject: "CooProg - Récapitulatif hebdomadaire",
    raw: `Cher {{user.firstName}} {{user.lastName}},
    
    Voici un récapitulatif hebdomadaire de ce qui s'est passé sur CooProg au cours des derniers jours.
    
    {{#if newProjectCount}}
    {{newProjectCount}} nouveaux projets ont été partagés.
    {{/if}}
    {{#if newUserCount}}
    {{newUserCount}} nouveaux utilisateurs ont rejoint.
    {{/if}}
    {{#if notifications.length}}
    Vous avez {{notifications.length}} notifications non lues :
    {{#each notifications}}
    {{#if this.type.project_joined}}
    {{this.meta.count}} nouveaux utilisateurs ont rejoint votre projet "{{this.meta.project.title}}".
    {{/if}}
    {{#if this.type.follow_request}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) souhaite vous suivre.
    {{/if}}
    {{#if this.type.follow_request_accepted}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) a accepté votre demande de suivi.
    {{/if}}
    {{#if this.type.follow_request_accepted_and_back}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) a accepté votre demande de suivi et vous suit également.
    {{/if}}
    {{#if this.type.project_edition}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} souhaite modifier certaines informations sur votre projet {{this.meta.project.title}}.
    {{/if}}
    {{#if this.type.project_edition_accepted}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} a accepté vos modifications sur le projet {{this.meta.project.title}}.
    {{/if}}
    {{#if this.type.project_edition_rejected}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} a refusé vos modifications sur le projet {{this.meta.project.title}}.
    {{/if}}
    {{#if this.type.project_shared}}
    {{this.meta.user.firstName}} {{this.meta.user.lastName}} souhaite attirer votre attention sur le projet {{this.meta.project.title}}.
    {{/if}}
    {{/each}}
    {{else}}
    Vous n'avez pas de notifications non lues.
    {{/if}}

    {{#if chatMessages.length}}
      Messages non lus:
      {{#each chatMessagesGrouped}}
        ---
        Projet: {{this.projectName}} ({{this.projectId}})
        {{#each this.tours}}
          Tour: {{this.tourName}} ({{this.tourId}})
          {{#each this.messages}}
            - [{{formatDate this.date 'fr'}}] {{#if this.sender}}{{this.sender.firstName}} {{this.sender.lastName}}{{else}}System{{/if}}: {{this.message}}
          {{/each}}
        {{/each}}
        ---
      {{/each}}
    {{else}}
      Vous n'avez pas de message non lu.
    {{/if}}

    Visitez www.cooprog.eu pour continuer à coordonner la programmation artistique dans le nouveau Régime Climatique.
    L'équipe CooProg`,
    html: `<p>Cher {{user.firstName}} {{user.lastName}},</p>
    <p>Voici un récapitulatif hebdomadaire de ce qui s\'est passé sur CooProg au cours des derniers jours.</p>
    {{#if newProjectCount}}
    <p>{{newProjectCount}} nouveaux projets ont été partagés.</p>
    {{/if}}
    {{#if newUserCount}}
    <p>{{newUserCount}} nouveaux utilisateurs ont rejoint.</p>
    {{/if}}
    {{#if notifications.length}}
    <p>Vous avez {{notifications.length}} notifications non lues :</p>
    <ul>
    {{#each notifications}}
    {{#if this.type.project_joined}}
    <li>{{this.meta.count}} nouveaux utilisateurs ont rejoint votre projet "{{this.meta.project.title}}".</li>
    {{/if}}
    {{#if this.type.follow_request}}
    <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) souhaite vous suivre.</li>
    {{/if}}
    {{#if this.type.project_edition}}
    <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} souhaite modifier certaines informations sur votre projet {{this.meta.project.title}}.</li>
    {{/if}}
    {{#if this.type.project_edition_accepted}}
    <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} a accepté vos modifications sur le projet {{this.meta.project.title}}.</li>
    {{/if}}
    {{#if this.type.project_edition_rejected}}
    <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} a refusé vos modifications sur le projet {{this.meta.project.title}}.</li>
    {{/if}}
    {{#if this.type.project_shared}}
    <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} souhaite attirer votre attention sur le projet {{this.meta.project.title}}.</li>
    {{/if}}
    {{/each}}
    </ul>
    {{else}}
    <p>Vous n'avez pas de notifications non lues.</p>
    {{/if}}

    {{#if chatMessages.length}}
    <p><strong>Messages non lus :</strong></p>

    {{#each chatMessagesGrouped}}
      <div style="margin-top: 1em; border-top: 1px solid #ccc; padding-top: 0.5em;">
        <p><u>Project:</u> {{this.projectName}}</p>
        {{#each this.tours}}
          <p style="margin-left: 1em;"><strong>Tour:</strong> {{this.tourName}}</p>
          <ul style="margin-left: 2em;">
            {{#each this.messages}}
              <li>
                <span>[{{formatDate this.date 'fr'}}]</span>
                <strong>{{#if this.sender}}{{this.sender.firstName}} {{this.sender.lastName}}{{else}}System{{/if}}</strong>:
                {{this.formattedMessage}}
              </li>
            {{/each}}
          </ul>
        {{/each}}
      </div>
    {{/each}}
    {{else}}
      <p>Vous n'avez pas de message non lu.</p>
    {{/if}}

    <p>Visitez <a href="http://www.cooprog.eu">cooprog.eu</a> pour continuer à coordonner la programmation artistique dans le nouveau Régime Climatique.</p>
    <p>L'équipe CooProg</p>`,
  },
  "invite-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre la tournée de {{project.title}}",
    raw: `
    Bonjour,

    {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre la tournée de {{project.title}}.

    {{#if message}}
    Voici son message personnel pour vous :

    "{{message.raw}}"
    {{/if}}

    CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.

    Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).
    
    CooProg vous permet de : 
    
    - Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation
    - Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement
    - Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous
    - Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées
    - Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée
    
    Nous serions ravi.e.s de vous compter parmi la communauté CooProg.
    
    Inscrivez-vous en cliquant sur le lien suivant : {{link}}.
    
    Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.
    
    L'équipe CooProg
    `,
    html: `
    <p>Bonjour,</p>

    <p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre la tournée de {{project.title}}.</p>

    {{#if message}}
    <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
      <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
    </div>
    {{/if}}

    <p>CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.</p>

    <p>Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).</p>
    
    <p>CooProg vous permet de :</p>
    
    <ul>
    <li>Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation</li>
    <li>Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement</li>
    <li>Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous</li>
    <li>Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées</li>
    <li>Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée</li>
    </ul>
    
    <p>Nous serions ravi.e.s de vous compter parmi la communauté CooProg.</p>
    <p>Inscrivez-vous en cliquant sur le lien suivant : <a href="{{link}}">{{link}}</a>.</p>
    
    <p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>
    
    <p>L'équipe CooProg</p>
    `,
  },
  "invite-project": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre le projet {{project.title}}",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre le projet {{project.title}}.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.

Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).

CooProg vous permet de : 

- Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation
- Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement
- Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous
- Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées
- Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée

Nous serions ravi.e.s de vous compter parmi la communauté CooProg.

Inscrivez-vous en cliquant sur le lien suivant : {{link}}.

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre le projet {{project.title}}</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.</p>

<p>Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).</p>

<p>CooProg vous permet de :</p>

<ul>
<li>Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation</li>
<li>Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement</li>
<li>Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous</li>
<li>Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées</li>
<li>Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée</li>
</ul>

<p>Nous serions ravi.e.s de vous compter parmi la communauté CooProg.</p>
<p>Inscrivez-vous en cliquant sur le lien suivant : <a href="{{link}}">{{link}}</a>.</p>

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>

<p>L'équipe CooProg</p>
    `,
  },
  "account-to-moderate": {
    subject:
      "{{#if subject}}{{subject}}{{else}}CooProg - Nouveaux utilisateurs à modérer - Récapitulatif quotidien{{/if}}",
    raw: `
Des nouveaux utilisateurs se sont inscrits sur CooProg et doivent être modérés.

{{#if disciplineFilter}}
{{#eq disciplineFilter "spectacle-vivant"}}
== Utilisateurs en Spectacle Vivant ({{spectacleVivantUsers.length}}) ==
{{#each spectacleVivantUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/eq}}

{{#eq disciplineFilter "musiques-actuelles"}}
== Utilisateurs en Musiques Actuelles ({{musiquesActuellesUsers.length}}) ==
{{#each musiquesActuellesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/eq}}
{{else}}
{{#if spectacleVivantUsers.length}}
== Utilisateurs en Spectacle Vivant ({{spectacleVivantUsers.length}}) ==
{{#each spectacleVivantUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/if}}

{{#if musiquesActuellesUsers.length}}
== Utilisateurs en Musiques Actuelles ({{musiquesActuellesUsers.length}}) ==
{{#each musiquesActuellesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/if}}

{{#if bothDisciplinesUsers.length}}
== Utilisateurs dans les deux disciplines ({{bothDisciplinesUsers.length}}) ==
{{#each bothDisciplinesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/if}}

{{#if noDisciplineUsers.length}}
== Utilisateurs sans discipline spécifiée ({{noDisciplineUsers.length}}) ==
{{#each noDisciplineUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Lien de modération: {{this.link}}
{{/each}}
{{/if}}
{{/if}}
    `,
    html: `
<p>Des nouveaux utilisateurs se sont inscrits sur CooProg et doivent être modérés.</p>

{{#if disciplineFilter}}
{{#eq disciplineFilter "spectacle-vivant"}}
<h3 style="margin-top: 20px; color: #FF8A47;">Utilisateurs en Spectacle Vivant ({{spectacleVivantUsers.length}})</h3>
<ul>
{{#each spectacleVivantUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/eq}}

{{#eq disciplineFilter "musiques-actuelles"}}
<h3 style="margin-top: 20px; color: #6BAF48;">Utilisateurs en Musiques Actuelles ({{musiquesActuellesUsers.length}})</h3>
<ul>
{{#each musiquesActuellesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/eq}}
{{else}}
{{#if spectacleVivantUsers.length}}
<h3 style="margin-top: 20px; color: #FF8A47;">Utilisateurs en Spectacle Vivant ({{spectacleVivantUsers.length}})</h3>
<ul>
{{#each spectacleVivantUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if musiquesActuellesUsers.length}}
<h3 style="margin-top: 20px; color: #6BAF48;">Utilisateurs en Musiques Actuelles ({{musiquesActuellesUsers.length}})</h3>
<ul>
{{#each musiquesActuellesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if bothDisciplinesUsers.length}}
<h3 style="margin-top: 20px; color: #7B68EE;">Utilisateurs dans les deux disciplines ({{bothDisciplinesUsers.length}})</h3>
<ul>
{{#each bothDisciplinesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if noDisciplineUsers.length}}
<h3 style="margin-top: 20px; color: #888888;">Utilisateurs sans discipline spécifiée ({{noDisciplineUsers.length}})</h3>
<ul>
{{#each noDisciplineUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Lien de modération</a>
  </li>
{{/each}}
</ul>
{{/if}}
{{/if}}
    `,
  },
  recover: {
    subject: "CooProg - Récupération mot de passe",
    raw: `
Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.

Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:
{{link}}

Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.
    `,
    html: `
<p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>
<p>Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:</p>
<p><a href="{{link}}">{{link}}</a></p>

<p>Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
`,
  },
  "send-message": {
    subject: "CooProg - Message utilisateur",
    raw: `
Nouveau message envoyé par un utilisateur

Utilisateur :
{{user.email}} / {{user.company}}

Objet du message :
{{subject}}

Message :
{{message}}

Url de la page d'où le message a été envoyé :
{{url}}
    `,
    html: `
<p>Nouveau message envoyé par un utilisateur</p>

<p><u>Utilisateur :</u></p>
<p>{{user.email}} / {{user.company}}</p>

<p><u>Objet du message :</u></p>
<p>{{subject}}</p>

<p><u>Message :</u></p>
<p>{{message}}</p>

<p><u>Url de la page d'où le message a été envoyé :</u></p>
<p>{{url}}</p>
    `,
  },
  "init-account": {
    subject: "CooProg - Création de compte",
    raw: `
Vous recevez cet email car vous avez été invités à utiliser CooProg.

Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:
{{link}}

Si vous n'avez pas demandé cela, veuillez ignorer cet email.
    `,
    html: `
<p>Vous recevez cet email car vous avez été invités à utiliser CooProg.</p>
<p>Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:</p>
<p><a href="{{link}}">{{link}}</a></p>
<p>Si vous n'avez pas demandé cela, veuillez ignorer cet email.</p>
`,
  },
  "moderation-accepted": {
    subject: "CooProg - Votre compte a été validé",
    raw: `
Bonjour,

Merci beaucoup pour l'intérêt que vous portez à CooProg et pour votre inscription !

Nous avons le plaisir de vous confirmer que votre inscription en tant que professionnel·le exerçant une fonction de programmation dans une structure de diffusion a bien été validée.

👉 Le compte de votre structure de diffusion est désormais créé.

Ce compte dispose d'une interface multi-utilisateurs, qui permet à plusieurs membres de votre équipe d'utiliser CooProg au nom de votre structure. Vous pouvez également y ajouter le logo de votre structure pour personnaliser votre espace.

L'adresse e-mail et le mot de passe définis lors de l'inscription sont communs à tous les profils rattachés à votre structure.

Ils peuvent être modifiés à tout moment depuis les paramètres du compte, si besoin.

🔑 Comment vos collaborateurs peuvent se connecter :

1. Se rendre sur https://www.cooprog.eu/
2. Se connecter avec l'adresse e-mail et le mot de passe de la structure
3. Créer ensuite leur profil personnel en renseignant leur propre adresse e-mail

Ils pourront ainsi accéder à toutes les fonctionnalités de CooProg, au même titre que vous.

👉 Connectez-vous dès maintenant sur https://www.cooprog.eu/ pour découvrir l'ensemble des outils mis à votre disposition.

Merci encore et bienvenue dans la communauté CooProg !

Bien cordialement,

L'équipe CooProg

    `,
    html: `
<p>Bonjour,</p>

<p>Merci beaucoup pour l'intérêt que vous portez à <b>CooProg</b> et pour votre inscription !</p>

<p>Nous avons le plaisir de vous confirmer que votre <b>inscription en tant que professionnel·le exerçant une fonction de programmation dans une structure de diffusion a bien été validée.</b></p>

<p>👉 <b>Le compte de votre structure de diffusion est désormais créé.</b></p>

<p>Ce compte dispose d'une <b>interface multi-utilisateurs</b>, qui permet à plusieurs membres de votre équipe d'utiliser CooProg au nom de votre structure. Vous pouvez également y <b>ajouter le logo de votre structure</b> pour personnaliser votre espace.</p>

<p>L'<b>adresse e-mail et le mot de passe</b> définis lors de l'inscription sont <b>communs à tous les profils</b> rattachés à votre structure.</p>

<p>Ils peuvent être <b>modifiés à tout moment</b> depuis les paramètres du compte, si besoin.</p>

<p>🔑 Comment vos collaborateurs peuvent se connecter :</p>

<ol>
<li>1. Se rendre sur <a href="https://www.cooprog.eu/">https://www.cooprog.eu/</a></li>
<li>2. Se connecter avec <b>l'adresse e-mail et le mot de passe de la structure</b></li>
<li>3. Créer ensuite leur <b>profil personnel</b> en renseignant leur propre adresse e-mail</li>
</ol>

<p>Ils pourront ainsi accéder à toutes les fonctionnalités de CooProg, au même titre que vous.</p>

<p>👉 <b>Connectez-vous dès maintenant</b> sur [www.cooprog.eu](https://www.cooprog.eu/) pour découvrir l'ensemble des outils mis à votre disposition.</p>

<p>Merci encore et bienvenue dans la communauté <b>CooProg</b> !</p>

<p>Bien cordialement,</p>

<p><b>L'équipe CooProg</b></p>
    `,
  },
  "moderation-rejected": {
    subject: "CooProg - Votre compte n'a pas été validé",
    raw: `Cher/chère {{user.firstName}} {{user.lastName}},

Merci pour l'intérêt que vous portez à CooProg et pour votre demande d'inscription.

CooProg est une plateforme conçue pour faciliter le partage en confiance des intentions de programmation entre programmateur·rices. À ce titre, nous vérifions systématiquement que les demandes d'inscription proviennent bien de personnes exerçant une fonction de programmation artistique à l'adresse indiquée.

À ce stade, nous n'avons pas encore pu valider ces informations vous concernant. Afin de finaliser votre inscription, nous vous serions reconnaissant·es de bien vouloir nous transmettre, à l'adresse contact@cooprog.eu, tout élément permettant de confirmer votre fonction de programmateur·rice.

Par ailleurs, si vous souhaitez rejoindre CooProg en tant qu'équipe artistique ou bureau de production, cela est possible sur invitation d'un·e programmateur.ice membre de la plateforme et qui a déjà partagé la tournée de votre spectacle (que les dates soient confirmées ou en option). Cette inscription vous permet alors d'accéder au projet de tournée d'un ou plusieurs spectacles que vous diffusez, et d'en gérer les informations (fiche spectacle, calendrier, etc.).

N'hésitez pas à nous contacter pour toute question complémentaire.
En vous remerciant pour votre compréhension,

Bien cordialement,

L'équipe CooProg
  `,
    html: `
    <p>Cher/chère {{user.firstName}} {{user.lastName}},</p>

    <p>Merci pour l'intérêt que vous portez à CooProg et pour votre demande d'inscription.</p>

    <p>CooProg est une plateforme conçue pour faciliter le partage en confiance des intentions de programmation entre programmateur·rices. À ce titre, nous vérifions systématiquement que les demandes d'inscription proviennent bien de personnes exerçant une fonction de programmation artistique à l'adresse indiquée.</p>

    <p>À ce stade, nous n'avons pas encore pu valider ces informations vous concernant. Afin de finaliser votre inscription, nous vous serions reconnaissant·es de bien vouloir nous transmettre, à l'adresse contact@cooprog.eu, tout élément permettant de confirmer votre fonction de programmateur·rice.</p>

    <p>Par ailleurs, si vous souhaitez rejoindre CooProg en tant qu'équipe artistique ou bureau de production, cela est possible sur invitation d'un·e programmateur.ice membre de la plateforme et qui a déjà partagé la tournée de votre spectacle (que les dates soient confirmées ou en option). Cette inscription vous permet alors d'accéder au projet de tournée d'un ou plusieurs spectacles que vous diffusez, et d'en gérer les informations (fiche spectacle, calendrier, etc.).</p>

    <p>N'hésitez pas à nous contacter pour toute question complémentaire.</p>

    <p>En vous remerciant pour votre compréhension,</p>

    <p>L'équipe CooProg</p>
  `,
  },
  "inactivity-removal-warning": {
    subject: "CooProg - Suppression de votre compte",
    raw: `
  Cher/chère {{user.firstName}} {{user.lastName}},

  Vous êtes inscrit.e sur CooProg, plateforme pour coordonner la programmation artistique dans le nouveau Régime Climatique.

  Vous ne vous êtes pas connecté⸱e à votre compte depuis près d'un an. Par souci de sobriété énergétique et pour ne pas conserver inutilement des données personnelles, nous supprimons automatiquement les comptes inactifs au bout d'un an.

  Rendez-vous donc vite sur www.cooprog.eu.

  Si vous souhaitez nous rejoindre plus tard, vous pourrez bien sûr vous inscrire de nouveau.

  Si par ailleurs vous avez décidé de ne plus utiliser CooProg n'hésitez pas à nous écrire à "adresse du modérateur" pour nous communiquer les raisons de votre décision. Cela ne peut que nous être utile pour améliorer les fonctionnalités du site.

  En espérant vous retrouver très vite sur CooProg,

  L'équipe CooProg
  `,
    html: `
    <p>Cher/chère {{user.firstName}} {{user.lastName}},</p>

    <p>Vous êtes inscrit.e sur CooProg, plateforme pour coordonner la programmation artistique dans le nouveau Régime Climatique.</p>

    <p>Vous ne vous êtes pas connecté⸱e à votre compte depuis près d'un an. Par souci de sobriété énergétique et pour ne pas conserver inutilement des données personnelles, nous supprimons automatiquement les comptes inactifs au bout d'un an.</p>

    <p>Rendez-vous donc vite sur <a href="https://www.cooprog.eu">www.cooprog.eu</a>.</p>

    <p>Si vous souhaitez nous rejoindre plus tard, vous pourrez bien sûr vous inscrire de nouveau.</p>

    <p>Si par ailleurs vous avez décidé de ne plus utiliser CooProg n'hésitez pas à nous écrire à "adresse du modérateur" pour nous communiquer les raisons de votre décision. Cela ne peut que nous être utile pour améliorer les fonctionnalités du site.</p>

    <p>En espérant vous retrouver très vite sur CooProg,</p>

    <p>L'équipe CooProg</p>
    `,
  },
  "invite-people": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre CooProg",
    raw: `
Bonjour,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre CooProg.

{{#if message}}
Voici son message personnel pour vous :

"{{message.raw}}"
{{/if}}

CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.

Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).

CooProg vous permet de : 

- Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation
- Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement
- Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous
- Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées
- Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée

Nous serions ravi.e.s de vous compter parmi la communauté CooProg.   

Inscrivez-vous en cliquant sur le lien suivant : {{link}}.

Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.

L'équipe CooProg
    `,
    html: `
<p>Bonjour,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} de {{invitingUser.company}} vous invite à rejoindre CooProg.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Voici son message personnel pour vous :</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>CooProg est une plateforme gratuite dédiée aux structures de diffusion, favorisant la coopération et la coprogrammation.</p>

<p>Elle est ouverte aux programmateur⸱ice⸱s du spectacle vivant ou des musiques actuelles travaillant au sein d'une structure de diffusion en Europe (théâtre, festival, scène labellisée, tiers-lieu, etc.).</p>

<p>CooProg vous permet de :</p>

<ul>
<li>Rejoindre des projets de tournée qui correspondent à vos capacités d'accueil et à vos choix de programmation</li>
<li>Collaborer en temps réel avec d'autres structures de diffusion et avec l'équipe artistique au montage de tournées cohérentes géographiquement et temporellement</li>
<li>Publier vos intentions de programmation pour susciter l'intérêt d'autres structures de diffusion autour de vous</li>
<li>Mutualiser les coûts avec vos partenaires de tournée pour des tournée mieux optimisées</li>
<li>Contribuer à la réduction de l'empreinte carbone de la tournée en réduisant les distances et les trajets entre chaque étape de tournée</li>
</ul>

<p>Nous serions ravi.e.s de vous compter parmi la communauté CooProg.</p>
<p>Inscrivez-vous en cliquant sur le lien suivant : <a href="{{link}}">{{link}}</a>.</p>

<p>Une question ? N'hésitez pas à nous écrire via le support en ligne ou à nous contacter directement.</p>

<p>L'équipe CooProg</p>
    `,
  },
};
