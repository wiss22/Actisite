import {defineArrayMember, defineField, defineType} from 'sanity'

const richTextBlock = defineArrayMember({
  type: 'block',
  styles: [
    {title: 'Paragraphe', value: 'normal'},
    {title: 'Titre 1', value: 'h1'},
    {title: 'Titre 2', value: 'h2'},
    {title: 'Titre 3', value: 'h3'},
    {title: 'Titre 4', value: 'h4'},
    {title: 'Citation', value: 'blockquote'},
  ],
  lists: [
    {title: 'Puces', value: 'bullet'},
    {title: 'Numérotée', value: 'number'},
  ],
  marks: {
    decorators: [
      {title: 'Gras', value: 'strong'},
      {title: 'Italique', value: 'em'},
      {title: 'Souligné', value: 'underline'},
      {title: 'Barré', value: 'strike-through'},
      {title: 'Code', value: 'code'},
    ],
    annotations: [
      defineArrayMember({
        name: 'link',
        title: 'Lien',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: (Rule) =>
              Rule.uri({
                scheme: ['https', 'http', 'mailto', 'tel'],
                allowRelative: true,
              }),
          }),
        ],
      }),
      defineArrayMember({
        name: 'textColor',
        title: 'Couleur du texte',
        type: 'object',
        fields: [
          defineField({
            name: 'value',
            title: 'Couleur',
            type: 'string',
            options: {
              list: [
                {title: 'Orange Actinuance', value: '#F18847'},
                {title: 'Violet profond', value: '#532369'},
                {title: 'Violet clair', value: '#8E6BC7'},
                {title: 'Noir signature', value: '#1F1630'},
                {title: 'Gris éditorial', value: '#6F6A78'},
              ],
              layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
          }),
        ],
      }),
    ],
  },
})

export const offerRexType = defineType({
  name: 'offerRex',
  title: 'REX Offres',
  type: 'document',
  groups: [
    {name: 'editorial', title: 'Editorial'},
    {name: 'content', title: 'Contenu'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'editorial',
      validation: (Rule) => Rule.required().min(8).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'editorial',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'offerTag',
      title: "Offre liée",
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'SWIFT CSP', value: 'swift-csp'},
          {title: 'Audit et Contrôles', value: 'audit-organisationnel'},
          {title: 'Résilience réglementaire', value: 'resilience-reglemenaire'},
          {title: 'DORA', value: 'dora'},
          {title: 'Conformité sectorielle', value: 'conformite-sectorielle'},
          {title: 'Sécurité du cloud', value: 'cyber-cloud'},
          {title: 'Sécurité du développement', value: 'cyber-development'},
          {title: 'Sécurité des industries', value: 'cyber-industries'},
          {title: 'Résilience opérationnelle', value: 'cyber-resilience-operationnelle'},
          {title: 'Cyber for AI', value: 'cyber-4-ai'},
          {title: 'Gouvernance (Risques Digitaux)', value: 'risques-gouvernance'},
          {title: 'Résilience (Risques Digitaux)', value: 'risques-resilience'},
          {title: 'Sensibilisation (Risques Digitaux)', value: 'risques-sensibilisation'},
          {title: 'Program strategy and delivery', value: 'transfo-program-strategy-delivery'},
          {title: 'Security capability implementation', value: 'transfo-security-capability-implementation'},
          {title: 'Security by design', value: 'transfo-security-by-design'},
          {title: 'Risques Digitaux', value: 'risques-digitaux'},
          {title: 'Cyber Défense', value: 'cyber-defense'},
          {title: 'Transfo Cyber', value: 'transfo-cyber'},
        ],
      },
    }),
    defineField({
      name: 'sector',
      title: 'Secteur',
      type: 'string',
      group: 'editorial',
      description: 'Ex: Banque, Assurance, Industrie...',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'location',
      title: 'Localisation',
      type: 'string',
      group: 'editorial',
      description: 'Ville / pays ou zone d’intervention.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'employeeCount',
      title: "Nombre d'employés de l'entreprise",
      type: 'string',
      group: 'editorial',
      description: 'Ex: 2 500+, 10 000+, 500-1 000.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'dispositif',
      title: 'Dispositif',
      type: 'string',
      group: 'editorial',
      description: "Format d'intervention (équipe, gouvernance, outillage...).",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: 'interventionDuration',
      title: "Durée d'intervention",
      type: 'string',
      group: 'editorial',
      description: 'Ex: 12 semaines, 6 mois, mission continue.',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'summary',
      title: 'Résumé court',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Texte affiché dans la carte REX.',
      validation: (Rule) => Rule.required().min(50).max(260),
    }),
    defineField({
      name: 'coverImage',
      title: 'Photo de couverture',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
          validation: (Rule) => Rule.max(140),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Description détaillée',
      type: 'array',
      group: 'content',
      of: [
        richTextBlock,
        defineField({
          name: 'inlineImage',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Texte alternatif',
              type: 'string',
              validation: (Rule) => Rule.max(140),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkUrl',
      title: 'Lien cible (optionnel)',
      type: 'url',
      group: 'editorial',
      description: 'Lien vers un article, cas client ou publication externe.',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['https'],
          allowRelative: true,
        }),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'Brouillon', value: 'draft'},
          {title: 'Publié', value: 'published'},
          {title: 'Archivé', value: 'archived'},
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      group: 'editorial',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'sector',
      status: 'status',
      media: 'coverImage',
    },
    prepare(selection) {
      const status = selection.status ? ` • ${selection.status}` : ''
      return {
        title: selection.title || 'REX sans titre',
        subtitle: `${selection.subtitle || 'secteur non défini'}${status}`,
        media: selection.media,
      }
    },
  },
})
