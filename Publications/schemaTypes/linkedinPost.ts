import {defineField, defineType} from 'sanity'

export const linkedinPostType = defineType({
  name: 'linkedinPost',
  title: 'LinkedIn Posts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required().min(6).max(140),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'Brouillon', value: 'draft'},
          {title: 'Publié', value: 'published'},
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'externalUrl',
      title: 'URL du post LinkedIn',
      type: 'url',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'offerTags',
      title: "Tags d'offre (liaison pages offres)",
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
        list: [
          {title: 'SWIFT CSP', value: 'swift-csp'},
          {title: 'Audit organisationnel', value: 'audit-organisationnel'},
          {title: 'Audit conformité NIS2/DORA', value: 'audit-conformite-nis-dora'},
          {title: 'Risques Digitaux', value: 'risques-digitaux'},
          {title: 'Cyber Défense', value: 'cyber-defense'},
          {title: 'Transfo Cyber', value: 'transfo-cyber'},
        ],
      },
      description: "Permet d'afficher ce post LinkedIn sur les pages d'offres correspondantes.",
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'externalUrl',
    },
  },
})
