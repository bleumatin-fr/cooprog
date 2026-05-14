export default {
  "added-artistic-team": {
    subject:
      "CooProg - You have been added to the artistic team of {{project.title}}",
    raw: `
Hello,

You have been added to the artistic team of {{project.title}} by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}}.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

To access CooProg as a member of the artistic team, please log in to CooProg.

Any questions? Feel free to reach out through the online support or contact us directly.

Best regards,

The CooProg Team
  `,
    html: `
<p>Hello,</p>

<p>You have been added to the artistic team of {{project.title}} by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>To access CooProg as a member of the artistic team, please log in to CooProg.</p>

<p>Any questions? Feel free to reach out through the online support or contact us directly.</p>

<p>Best regards,</p>

<p>The CooProg Team</p>
    `,
  },
  "added-diffusion-structure": {
    subject: "CooProg - You have been added to the tour of {{project.title}}",
    raw: `
Hello,

You have been added to the tour of {{project.title}} by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}}.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

To access CooProg as a member of the tour, please log in to CooProg.

Any questions? Feel free to reach out through the online support or contact us directly.

Best regards,

The CooProg Team
  `,
    html: `
<p>Hello,</p>

<p>You have been added to the tour of {{project.title}} by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>To access CooProg as a member of the tour, please log in to CooProg.</p>

<p>Any questions? Feel free to reach out through the online support or contact us directly.</p>

<p>Best regards,</p>

<p>The CooProg Team</p>
    `,
  },
  "invite-artistic-team": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} invites you to join the project {{project.title}}",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has registered the show "{{project.title}}" on the CooProg platform.

As a member of the artistic team, you are invited by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} to log in to CooProg in order to complete the information related to the project "{{project.title}}".

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

You will be able to enter details about the show and update the calendar.

The more accurate and up-to-date the data entered on CooProg is, the more relevant and useful the platform becomes.

*CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.*

*CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.*

To access CooProg as a member of the artistic team, please register via the following link: {{link}}.

Any questions? Feel free to reach out through the online support or contact us directly.

Best regards,

The CooProg Team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has registered the show "{{project.title}}" on the CooProg platform.</p>

<p>As a member of the artistic team, you are invited by {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} to log in to CooProg in order to complete the information related to the project "{{project.title}}".</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>You will be able to enter details about the show and update the calendar.</p>

<p>The more accurate and up-to-date the data entered on CooProg is, the more relevant and useful the platform becomes.</p>

<p><em>CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.</em></p>

<p><em>CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.</em></p>

<p>To access CooProg as a member of the artistic team, please register via the following link: <a href="{{link}}">{{link}}</a>.</p>

<p>Any questions? Feel free to reach out through the online support or contact us directly.</p>

<p>Best regards,</p>

<p>The CooProg Team</p>
    `,
  },
  "invite-diffusion-structure": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} invites you to join the project {{project.title}}",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} is inviting you to coordinate a touring project on the CooProg platform for the show "{{project.title}}".

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

To do so, join CooProg and register by clicking the following link: {{link}}.

*CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.*

*CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.*

Any questions? Feel free to reach out through our online support or contact us directly.

The CooProg Team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} is inviting you to coordinate a touring project on the CooProg platform for the show "{{project.title}}".</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>To do so, join CooProg and register by clicking the following link: <a href="{{link}}">{{link}}</a>.</p>

<p><em>CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.</em></p>

<p><em>CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.</em></p>

<p>Any questions? Feel free to reach out through our online support or contact us directly.</p>

<p>The CooProg Team</p>
    `,
  },
  "invite-schedule-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} invites you to participate in the tour of {{project.title}}",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has indicated that your programming organization is participating in the tour of {{project.title}} on {{formatDate program.date 'en'}}.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

To verify, modify, or complete the dates of your programming, join CooProg and register by clicking the following link: {{link}}.

*CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.*

*CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.*

Any questions? Feel free to contact us through the online support or reach out directly.

Best regards,

The CooProg Team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has indicated that your programming organization is participating in the tour of {{project.title}} on {{formatDate program.date 'en'}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>To verify, modify, or complete the dates of your programming, join CooProg and register by clicking the following link: <a href="{{link}}">{{link}}</a>.</p>

<p><em>CooProg is a free and collaborative platform for building tours, accessible to all professionals who present or program works in the performing arts and/or contemporary music sectors.</em></p>

<p><em>CooProg is led by Onda (French Office for Contemporary Performing Arts Circulation) and Zone Franche - the World Music Network.</em></p>

<p>Any questions? Feel free to contact us through the online support or reach out directly.</p>

<p>Best regards,</p>

<p>The CooProg Team</p>
    `,
  },
  "schedule-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} indicated a new date for your participation in the tour of {{project.title}}",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has indicated that your organization is hosting a date of the tour for {{project.title}} on {{formatDate program.date 'en'}}.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

To verify, update, or complete the information related to your programming, please log in to CooProg.

The more accurate and up-to-date the data entered on CooProg is, the more relevant and useful the platform becomes.

Thank you in advance for your contribution!

Best regards,

The CooProg Team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} has indicated that your organization is hosting a date of the tour for {{project.title}} on {{formatDate program.date 'en'}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>To verify, update, or complete the information related to your programming, please log in to CooProg.</p>

<p>The more accurate and up-to-date the data entered on CooProg is, the more relevant and useful the platform becomes.</p>

<p>Thank you in advance for your contribution!</p>

<p>Best regards,</p>

<p>The CooProg Team</p>
    `,
  },
  "invite-tour": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{user.company}} invites you to join the tour of {{project.title}}",
    raw: `
    Hello,

    {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{user.company}} invites you to join the tour of {{project.title}}.

    {{#if message}}
    Here's their personal message for you:

    "{{message.raw}}"
    {{/if}}

    CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.

    It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).

    CooProg enables you to:

    - Join tour projects that match your hosting capacities and programming choices
    - Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally
    - Publish your programming intentions to spark interest from other diffusion structures around you
    - Share costs with your tour partners for better optimized tours
    - Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop

    We would be delighted to have you join the CooProg community.

    Sign up by clicking on the following link: {{link}}.

    Have a question? Don't hesitate to write to us via online support or contact us directly.

    The CooProg team
    `,
    html: `
    <p>Hello,</p>

    <p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{user.company}} invites you to join the tour of {{project.title}}.</p>

    {{#if message}}
    <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
      <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
    </div>
    {{/if}}

    <p>CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.</p>

    <p>It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).</p>

    <p>CooProg enables you to:</p>

    <ul>
    <li>Join tour projects that match your hosting capacities and programming choices</li>
    <li>Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally</li>
    <li>Publish your programming intentions to spark interest from other diffusion structures around you</li>
    <li>Share costs with your tour partners for better optimized tours</li>
    <li>Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop</li>
    </ul>

    <p>We would be delighted to have you join the CooProg community.</p>
    <p>Sign up by clicking on the following link: <a href="{{link}}">{{link}}</a>.</p>

    <p>Have a question? Don't hesitate to write to us via online support or contact us directly.</p>

    <p>The CooProg team</p>
    `,
  },
  "invite-project": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUsercompany}} invites you to join the project {{project.title}}",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUsercompany}} invites you to join the project {{project.title}}.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.

It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).

CooProg enables you to:

- Join tour projects that match your hosting capacities and programming choices
- Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally
- Publish your programming intentions to spark interest from other diffusion structures around you
- Share costs with your tour partners for better optimized tours
- Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop

We would be delighted to have you join the CooProg community.

Sign up by clicking on the following link: {{link}}.

Have a question? Don't hesitate to write to us via online support or contact us directly.

The CooProg team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUsercompany}} invites you to join the project {{project.title}}.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.</p>

<p>It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).</p>

<p>CooProg enables you to:</p>

<ul>
<li>Join tour projects that match your hosting capacities and programming choices</li>
<li>Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally</li>
<li>Publish your programming intentions to spark interest from other diffusion structures around you</li>
<li>Share costs with your tour partners for better optimized tours</li>
<li>Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop</li>
</ul>

<p>We would be delighted to have you join the CooProg community.</p>
<p>Sign up by clicking on the following link: <a href="{{link}}">{{link}}</a>.</p>

<p>Have a question? Don't hesitate to write to us via online support or contact us directly.</p>

<p>The CooProg team</p>
    `,
  },
  "invite-people": {
    subject:
      "CooProg - {{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} invites you to join CooProg",
    raw: `
Hello,

{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} is inviting you to join CooProg.

{{#if message}}
Here's their personal message for you:

"{{message.raw}}"
{{/if}}

CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.

It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).

CooProg enables you to:

- Join tour projects that match your hosting capacities and programming choices
- Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally
- Publish your programming intentions to spark interest from other diffusion structures around you
- Share costs with your tour partners for better optimized tours
- Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop

We would be delighted to have you join the CooProg community.

Sign up by clicking on the following link: {{link}}.

Have a question? Don't hesitate to write to us via online support or contact us directly.

The CooProg team
    `,
    html: `
<p>Hello,</p>

<p>{{invitingUserProfile.firstName}} {{invitingUserProfile.lastName}} from {{invitingUser.company}} is inviting you to join CooProg.</p>

{{#if message}}
<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 16px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0 0 8px 0; font-weight: 600; color: #495057;">Here's their personal message for you:</p>
  <p style="margin: 0; font-style: italic; color: #6c757d;">{{{message.html}}}</p>
</div>
{{/if}}

<p>CooProg is a free platform dedicated to diffusion structures, promoting cooperation and co-programming.</p>

<p>It is open to programmers of performing arts or current music working within a diffusion structure in Europe (theater, festival, labeled venue, third place, etc.).</p>

<p>CooProg enables you to:</p>

<ul>
<li>Join tour projects that match your hosting capacities and programming choices</li>
<li>Collaborate in real time with other diffusion structures and with the artistic team in setting up tours that are coherent geographically and temporally</li>
<li>Publish your programming intentions to spark interest from other diffusion structures around you</li>
<li>Share costs with your tour partners for better optimized tours</li>
<li>Contribute to reducing the carbon footprint of tours by reducing distances and journeys between each tour stop</li>
</ul>

<p>We would be delighted to have you join the CooProg community.</p>

<p>Sign up by clicking on the following link: <a href="{{link}}">{{link}}</a>.</p>

<p>Have a question? Don't hesitate to write to us via online support or contact us directly.</p>

<p>The CooProg team</p>
    `,
  },
  "weekly-dupes-admin": {
    subject: "CooProg - Weekly Dupes Summary",
    raw: `
  Dear Administrator,

  Here is a summary of the projects that have been identified as duplicates:

  {{#each dupes}}
  ---
  {{#each this}}
  {{this.artist}} - {{this.work}} - https://cooprog.eu/projects/{{this._id}}
  {{/each}}
  ---
  {{/each}}
      `,
    html: `
  <p>Dear Administrator,</p>

  <p>Here is a summary of the projects that have been identified as duplicates:</p>

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
    subject: "CooProg - Weekly Digest Sent",
    raw: `
  Dear Administrator,

  The weekly digest has been sent to {{count}} users.

  {{#if errors.length}}
  Errors:
  {{#each errors}}
  {{this.email}}: {{this.error}}
  {{/each}}
  {{else}}
  No errors.
  {{/if}}
      `,
    html: `
  <p>Dear Administrator,</p>

  <p>The weekly digest has been sent to {{count}} users.</p>

  {{#if errors.length}}
  <p><u>Errors:</u></p>
  <ul>
  {{#each errors}}
  <li>{{this.email}}: {{this.error}}</li>
  {{/each}}
  </ul>
  {{else}}
  <p>No errors.</p>
  {{/if}}
      `,
  },
  "weekly-digest": {
    subject: "CooProg - What happened last week?",
    raw: `
  Dear {{user.firstName}} {{user.lastName}},
  
  Here's a weekly digest of what happened on CooProg within the last days.
  
  {{#if newProjectCount}}
  {{newProjectCount}} new projects were shared.
  {{#each newProjects}}
  {{this.artist}} - {{this.work}} - https://cooprog.eu/projects/{{this._id}}
  {{/each}}
  {{/if}}
  
  {{#if newUserCount}}
  {{newUserCount}} new users joined.
  {{#each newUsers}}
  {{this.company}} - https://cooprog.eu/users/{{this._id}}
  {{/each}}
  {{/if}}
  
  {{#if notifications.length}}
  You have {{notifications.length}} unread notifications:
    {{#each notifications}}
      {{#if this.type.project_joined}}
        {{this.meta.count}} new users joined your project "{{this.meta.project.title}}".
      {{/if}}

      {{#if this.type.follow_request}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) wants to follow you
      {{/if}}

      {{#if this.type.follow_request_accepted}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) accepted your follow request
      {{/if}}

      {{#if this.type.follow_request_accepted_and_back}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) accepted your follow request and is following you back
      {{/if}}

      {{#if this.type.project_edition}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} wishes to edit some information on your project {{this.meta.project.title}}
      {{/if}}

      {{#if this.type.project_edition_accepted}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} accepted your edits on the project {{this.meta.project.title}}
      {{/if}}

      {{#if this.type.project_edition_rejected}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} refused your edits on the project {{this.meta.project.title}}
      {{/if}}

      {{#if this.type.project_shared}}
        {{this.meta.user.firstName}} {{this.meta.user.lastName}} wants to bring your attention onto the project {{this.meta.project.title}}
      {{/if}}
    {{/each}}
  {{else}}
  You have no unread notifications.
  {{/if}}
  {{#if chatMessages.length}}
    Unread messages:
    {{#each chatMessagesGrouped}}
      ---
      Project: {{this.projectName}} ({{this.projectId}})
      {{#each this.tours}}
        Tour: {{this.tourName}} ({{this.tourId}})
        {{#each this.messages}}
          - [{{formatDate this.date 'en'}}] {{#if this.sender}}{{this.sender.firstName}} {{this.sender.lastName}}{{else}}System{{/if}}: {{this.message}}
        {{/each}}
      {{/each}}
      ---
    {{/each}}
  {{else}}
    You have no unread messages.
  {{/if}}


  Visit www.cooprog.eu to continue coordinating artistic programming in the new Climate Regime.

  The CooProg team
      `,
    html: `<p>Dear {{user.firstName}} {{user.lastName}},</p>

    <p>Here's a weekly digest of what happened on CooProg within the last days.</p>

{{#if newProjectCount}}
<p>{{newProjectCount}} new projects were shared.</p>
<ul>
{{#each newProjects}}
<li><a href="https://cooprog.eu/projects/{{this._id}}">{{this.artist}} - {{this.work}}</a></li>
{{/each}}
</ul>
{{/if}}

{{#if newUserCount}}
<p>{{newUserCount}} new users joined.</p>
<ul>
{{#each newUsers}}
<li><a href="https://cooprog.eu/users/{{this._id}}">{{this.company}}</a></li>
{{/each}}
</ul>
{{/if}}

{{#if notifications.length}}
<p>You have {{notifications.length}} unread notifications:</p>
  <ul>
  {{#each notifications}}
    {{#if this.type.project_joined}}
      <li>{{this.meta.count}} new users joined your project "{{this.meta.project.title}}".</li>
    {{/if}}

    {{#if this.type.follow_request}}
      <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} ({{this.meta.user.company}}) wants to follow you</li>
    {{/if}}

    {{#if this.type.project_edition}}
      <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} wishes to edit some information on your project {{this.meta.project.title}}</li>
    {{/if}}

    {{#if this.type.project_edition_accepted}}
      <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} accepted your edits on the project {{this.meta.project.title}}</li>
    {{/if}}

    {{#if this.type.project_edition_rejected}}
      <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} refused your edits on the project {{this.meta.project.title}}</li>
    {{/if}}

    {{#if this.type.project_shared}}
      <li>{{this.meta.user.firstName}} {{this.meta.user.lastName}} wants to bring your attention onto the project {{this.meta.project.title}}</li>
    {{/if}}
  {{/each}}
  </ul>
{{else}}
<p>You have no unread notifications.</p>
{{/if}}
{{#if chatMessages.length}}
  <p><strong>Unread messages:</strong></p>
  
  {{#each chatMessagesGrouped}}
    <div style="margin-top: 1em; border-top: 1px solid #ccc; padding-top: 0.5em;">
      <p><u>Project:</u> {{this.projectName}}</p>
      {{#each this.tours}}
        <p style="margin-left: 1em;"><strong>Tour:</strong> {{this.tourName}}</p>
        <ul style="margin-left: 2em;">
          {{#each this.messages}}
            <li>
              <span>[{{this.formattedDate}}]</span>
              <strong>{{#if this.sender}}{{this.sender.firstName}} {{this.sender.lastName}}{{else}}System{{/if}}</strong>:
              {{this.formattedMessage}}
            </li>
          {{/each}}
        </ul>
      {{/each}}
    </div>
  {{/each}}
{{else}}
  <p>You have no unread messages.</p>
{{/if}}


<p>Visit <a href="http://www.cooprog.eu">cooprog.eu</a> to continue coordinating artistic programming in the new Climate Regime.</p>

<p>The CooProg team</p>`,
  },
  "account-to-moderate": {
    subject:
      "{{#if subject}}{{subject}}{{else}}CooProg - New users to moderate - Daily summary{{/if}}",
    raw: `
New users have registered on CooProg and require moderation.

{{#if disciplineFilter}}
{{#eq disciplineFilter "spectacle-vivant"}}
== Performing Arts Users ({{spectacleVivantUsers.length}}) ==
{{#each spectacleVivantUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/eq}}

{{#eq disciplineFilter "musiques-actuelles"}}
== Contemporary Music Users ({{musiquesActuellesUsers.length}}) ==
{{#each musiquesActuellesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/eq}}
{{else}}
{{#if spectacleVivantUsers.length}}
== Performing Arts Users ({{spectacleVivantUsers.length}}) ==
{{#each spectacleVivantUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/if}}

{{#if musiquesActuellesUsers.length}}
== Contemporary Music Users ({{musiquesActuellesUsers.length}}) ==
{{#each musiquesActuellesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/if}}

{{#if bothDisciplinesUsers.length}}
== Users in both disciplines ({{bothDisciplinesUsers.length}}) ==
{{#each bothDisciplinesUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/if}}

{{#if noDisciplineUsers.length}}
== Users with no specified discipline ({{noDisciplineUsers.length}}) ==
{{#each noDisciplineUsers}}
- {{this.firstName}} {{this.lastName}} ({{this.company}})
  Moderation link: {{this.link}}
{{/each}}
{{/if}}
{{/if}}
    `,
    html: `
<p>New users have registered on CooProg and require moderation.</p>

{{#if disciplineFilter}}
{{#eq disciplineFilter "spectacle-vivant"}}
<h3 style="margin-top: 20px; color: #FF8A47;">Performing Arts Users ({{spectacleVivantUsers.length}})</h3>
<ul>
{{#each spectacleVivantUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/eq}}

{{#eq disciplineFilter "musiques-actuelles"}}
<h3 style="margin-top: 20px; color: #6BAF48;">Contemporary Music Users ({{musiquesActuellesUsers.length}})</h3>
<ul>
{{#each musiquesActuellesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/eq}}
{{else}}
{{#if spectacleVivantUsers.length}}
<h3 style="margin-top: 20px; color: #FF8A47;">Performing Arts Users ({{spectacleVivantUsers.length}})</h3>
<ul>
{{#each spectacleVivantUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if musiquesActuellesUsers.length}}
<h3 style="margin-top: 20px; color: #6BAF48;">Contemporary Music Users ({{musiquesActuellesUsers.length}})</h3>
<ul>
{{#each musiquesActuellesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if bothDisciplinesUsers.length}}
<h3 style="margin-top: 20px; color: #7B68EE;">Users in both disciplines ({{bothDisciplinesUsers.length}})</h3>
<ul>
{{#each bothDisciplinesUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/if}}

{{#if noDisciplineUsers.length}}
<h3 style="margin-top: 20px; color: #888888;">Users with no specified discipline ({{noDisciplineUsers.length}})</h3>
<ul>
{{#each noDisciplineUsers}}
  <li>
    <strong>{{this.firstName}} {{this.lastName}}</strong> ({{this.company}})<br>
    <a href="{{this.link}}">Moderation link</a>
  </li>
{{/each}}
</ul>
{{/if}}
{{/if}}
    `,
  },
  recover: {
    subject: "CooProg - Password Recovery",
    raw: `
You are receiving this email because you (or someone else) has requested a password reset for your account.

Please click the link below or copy/paste it into your browser to complete the process:
{{link}}

If you didn't request this, please ignore this email and your password will remain unchanged.
    `,
    html: `
<p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
<p>Please click the link below or copy/paste it into your browser to complete the process:</p>
<p><a href="{{link}}">{{link}}</a></p>

<p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
`,
  },
  "send-message": {
    subject: "CooProg - User Message",
    raw: `
New message sent by a user

User:
{{user.email}} / {{user.company}}

Message Subject:
{{subject}}

Message:
{{message}}

URL of the page from which the message was sent:
{{url}}
    `,
    html: `
<p>New message sent by a user</p>

<p><u>User:</u></p>
<p>{{user.email}} / {{user.company}}</p>

<p><u>Message Subject:</u></p>
<p>{{subject}}</p>

<p><u>Message:</u></p>
<p>{{message}}</p>

<p><u>URL of the page from which the message was sent:</u></p>
<p>{{url}}</p>
    `,
  },
  "init-account": {
    subject: "CooProg - Account Creation",
    raw: `
You are receiving this email because you have been invited to use CooProg.

Please click the link below or copy/paste it into your browser to complete the process:
{{link}}

If you didn't request this, please ignore this email.
    `,
    html: `
<p>You are receiving this email because you have been invited to use CooProg.</p>
<p>Please click the link below or copy/paste it into your browser to complete the process:</p>
<p><a href="{{link}}">{{link}}</a></p>
<p>If you didn't request this, please ignore this email.</p>
`,
  },
  "moderation-accepted": {
    subject: "CooProg - Your account has been validated",
    raw: `
Hello,

Thank you very much for your interest in CooProg and for your registration!

We are pleased to confirm that your registration as a professional working in a programming role at a diffusion structure has been validated.

👉 Your diffusion structure account has now been created.

This account features a multi-user interface, which allows multiple members of your team to use CooProg on behalf of your structure. You can also add your structure's logo to personalize your space.

The email address and password set during registration are shared by all profiles linked to your structure.

They can be modified at any time from the account settings, if needed.

🔑 How your collaborators can log in:

1. Go to https://www.cooprog.eu/
2. Log in with the structure's email address and password
3. Then create their personal profile by entering their own email address

They will thus be able to access all of CooProg's features, just like you.

👉 Log in now at https://www.cooprog.eu/ to discover all the tools available to you.

Thank you again and welcome to the CooProg community!

Best regards,

The CooProg team

    `,
    html: `
<p>Hello,</p>

<p>Thank you very much for your interest in <b>CooProg</b> and for your registration!</p>

<p>We are pleased to confirm that your <b>registration as a professional working in a programming role at a diffusion structure has been validated.</b></p>

<p>👉 <b>Your diffusion structure account has now been created.</b></p>

<p>This account features a <b>multi-user interface</b>, which allows multiple members of your team to use CooProg on behalf of your structure. You can also <b>add your structure's logo</b> to personalize your space.</p>

<p>The <b>email address and password</b> set during registration are <b>shared by all profiles</b> linked to your structure.</p>

<p>They can be <b>modified at any time</b> from the account settings, if needed.</p>

<p>🔑 How your collaborators can log in:</p>

<ol>
<li>1. Go to <a href="https://www.cooprog.eu/">https://www.cooprog.eu/</a></li>
<li>2. Log in with <b>the structure's email address and password</b></li>
<li>3. Then create their <b>personal profile</b> by entering their own email address</li>
</ol>

<p>They will thus be able to access all of CooProg's features, just like you.</p>

<p>👉 <b>Log in now</b> at [www.cooprog.eu](https://www.cooprog.eu/) to discover all the tools available to you.</p>

<p>Thank you again and welcome to the <b>CooProg</b> community!</p>

<p>Best regards,</p>

<p><b>The CooProg team</b></p>
    `,
  },
  "moderation-rejected": {
    subject: "CooProg - Account Validation",
    raw: `
Dear {{user.firstName}} {{user.lastName}},

Thank you for your interest in CooProg and for your registration request.

CooProg is a platform designed to facilitate the trusted sharing of programming intentions between programmers. As such, we systematically verify that registration requests come from individuals who hold an artistic programming role at the indicated organization.

At this stage, we have not yet been able to verify this information in your case. To complete your registration, we would be grateful if you could send us, at contact@cooprog.eu, any supporting documents or details confirming your role as a programmer.

Additionally, if you wish to join CooProg as an artistic team or production office, this is possible by invitation from a programmer who is already a member of the platform and has shared the tour of your show (whether the dates are confirmed or still tentative). Once you are invited by a programmer to join CooProg, you will have accessto the tour project of one or more shows you are in charge of and you will be able to manage related information (show sheet, calendar, etc.).

Please don't hesitate to contact us if you have any further questions.

Thank you for your understanding,

Best regards,

The CooProg team
    `,
    html: `
    <p>Dear {{user.firstName}} {{user.lastName}},</p>

    <p>Thank you for your interest in CooProg and for your registration request.</p>

    <p>CooProg is a platform designed to facilitate the trusted sharing of programming intentions between programmers. As such, we systematically verify that registration requests come from individuals who hold an artistic programming role at the indicated organization.</p>

    <p>At this stage, we have not yet been able to verify this information in your case. To complete your registration, we would be grateful if you could send us, at contact@cooprog.eu, any supporting documents or details confirming your role as a programmer.</p>

    <p>Additionally, if you wish to join CooProg as an artistic team or production office, this is possible by invitation from a programmer who is already a member of the platform and has shared the tour of your show (whether the dates are confirmed or still tentative). Once you are invited by a programmer to join CooProg, you will have accessto the tour project of one or more shows you are in charge of and you will be able to manage related information (show sheet, calendar, etc.).</p>

    <p>Please don't hesitate to contact us if you have any further questions.</p>

    <p>Thank you for your understanding,</p>

    <p>Best regards,</p>

    <p>The CooProg team</p>
        `,
  },
  "inactivity-removal-warning": {
    subject: "CooProg - Account Removal",
    raw: `
  Dear {{user.firstName}} {{user.lastName}},

  You are registered on CooProg, the platform to coordinate artistic programming in the new Climate Regime.

  You have not logged in to your account for almost a year. In order to save energy and not to keep personal data unnecessarily, we automatically delete inactive accounts after one year.

  So please visit www.cooprog.eu soon.

  If you want to join us later, you can of course register again.

  If you have decided not to use CooProg anymore, please write to us at "moderator's address" and tell us why you don't want to use it anymore. This can only help us to improve the functionality of the site.

  We hope to see you soon on CooProg,

  The CooProg team
  `,
    html: `
  <p>Dear {{user.firstName}} {{user.lastName}},</p>

  <p>You are registered on CooProg, the platform to coordinate artistic programming in the new Climate Regime.</p>

  <p>You have not logged in to your account for almost a year. In order to save energy and not to keep personal data unnecessarily, we automatically delete inactive accounts after one year.</p>

  <p>So please visit <a href="www.cooprog.eu">www.cooprog.eu</a> soon.</p>

  <p>If you want to join us later, you can of course register again.</p>

  <p>If you have decided not to use CooProg anymore, please write to us at "moderator's address" and tell us why you don't want to use it anymore. This can only help us to improve the functionality of the site.</p>

  <p>We hope to see you soon on CooProg,</p>

  <p>The CooProg team</p>
  `,
  },
};
