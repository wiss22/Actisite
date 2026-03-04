import {defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Auteurs',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'role',
      title: 'Rôle',
      type: 'string',
      initialValue: 'Consultant Actinuance',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['https'],
          allowRelative: false,
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
    },
  },
})

export const blogPostType = defineType({
  name: 'blogPost',
  title: 'Publications',
  type: 'document',
  groups: [
    {name: 'editorial', title: 'Editorial'},
    {name: 'content', title: 'Contenu'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'editorial',
      validation: (Rule) => Rule.required().min(10).max(120),
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
      name: 'publicationType',
      title: 'Type de publication',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'Article', value: 'article'},
          {title: 'Innovation', value: 'innovation'},
        ],
        layout: 'radio',
      },
      initialValue: 'article',
      validation: (Rule) => Rule.required(),
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
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'editorial',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
          validation: (Rule) => Rule.required().max(140),
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Extrait',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Résumé court affiché dans les cartes du site.',
      validation: (Rule) => Rule.required().min(80).max(260),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        {type: 'block'},
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
        defineField({
          name: 'videoEmbed',
          title: 'Vidéo (embed)',
          type: 'object',
          fields: [
            defineField({
              name: 'videoUrl',
              title: 'URL vidéo',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({
                  scheme: ['https'],
                  allowRelative: false,
                }),
            }),
            defineField({
              name: 'title',
              title: 'Titre vidéo (optionnel)',
              type: 'string',
              validation: (Rule) => Rule.max(140),
            }),
          ],
        }),
        defineField({
          name: 'pdfDocument',
          title: 'Document PDF',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre du document',
              type: 'string',
              validation: (Rule) => Rule.max(140),
            }),
            defineField({
              name: 'pdfFile',
              title: 'Fichier PDF',
              type: 'file',
              options: {accept: 'application/pdf'},
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'offerTag',
      title: "Tags d'offre (liaison pages offres)",
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'SWIFT CSP', value: 'swift-csp'},
          {title: 'Cyber for AI', value: 'cyber-4-ai'},
          {title: 'Audit organisationnel', value: 'audit-organisationnel'},
          {title: 'Audit conformité NIS2/DORA', value: 'audit-conformite-nis-dora'},
          {title: 'Sécurité du cloud', value: 'cyber-cloud'},
          {title: 'Sécurité du développement', value: 'cyber-development'},
          {title: 'Sécurité des industries', value: 'cyber-industries'},
          {title: 'Résilience opérationnelle', value: 'cyber-resilience-operationnelle'},
          {title: 'Risques Digitaux', value: 'risques-digitaux'},
          {title: 'Cyber Défense', value: 'cyber-defense'},
          {title: 'Transfo Cyber', value: 'transfo-cyber'},
        ],
      },
      description: "Champ optionnel: choisissez une offre dans la liste déroulante pour lier l'article.",
    }),
    defineField({
      name: 'isFeatured',
      title: 'Mettre en avant',
      type: 'boolean',
      group: 'editorial',
      initialValue: false,
    }),
    defineField({
      name: 'externalUrl',
      title: 'URL externe (optionnel)',
      type: 'url',
      group: 'editorial',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO - Titre',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO - Description',
      type: 'text',
      rows: 2,
      group: 'seo',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  orderings: [
    {
      title: 'Plus récent',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publicationType',
      media: 'coverImage',
      status: 'status',
    },
    prepare(selection) {
      const typeLabel =
        selection.subtitle === 'innovation' ? 'Innovation' : 'Article'

      return {
        title: selection.title,
        subtitle: `${typeLabel} · ${selection.status ?? 'draft'}`,
        media: selection.media,
      }
    },
  },
})
