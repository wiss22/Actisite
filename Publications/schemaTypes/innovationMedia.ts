import {defineField, defineType} from 'sanity'

export const innovationMediaType = defineType({
  name: 'innovationMedia',
  title: 'Innovation (PDF & Vidéos)',
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
      validation: (Rule) => Rule.required().min(6).max(140),
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
      name: 'excerpt',
      title: 'Résumé',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (Rule) => Rule.max(260),
    }),
    defineField({
      name: 'mediaItems',
      title: 'Médias innovation',
      type: 'array',
      group: 'content',
      of: [
        defineField({
          name: 'videoEmbed',
          title: 'Vidéo',
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
      validation: (Rule) => Rule.required().min(1),
      description: 'Section innovation dédiée aux formats vidéo et PDF uniquement.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      count: 'mediaItems',
    },
    prepare(selection) {
      const count = Array.isArray(selection.count) ? selection.count.length : 0
      const status = selection.status ? ` • ${selection.status}` : ''
      return {
        title: selection.title || 'Innovation sans titre',
        subtitle: `${count} média(s)${status}`,
      }
    },
  },
})

