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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'externalUrl',
    },
  },
})
