import {defineField, defineType} from 'sanity'

export const aiObservedVectorsType = defineType({
  name: 'aiObservedVectors',
  title: 'Vecteurs IA observés',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre bloc',
      type: 'string',
      initialValue: 'Vecteurs IA observés',
      validation: (Rule) => Rule.required().min(4).max(80),
    }),
    defineField({
      name: 'periodLabel',
      title: 'Période',
      type: 'string',
      initialValue: '2025',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'sourceNote',
      title: 'Note de source',
      type: 'string',
      initialValue: 'Vecteurs issus de nos missions 2024 et 2025 sur systèmes IA en production',
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: 'isPublished',
      title: 'Publier sur le site',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'vectors',
      title: 'Liste des vecteurs',
      type: 'array',
      validation: (Rule) => Rule.required().min(1).max(12),
      of: [
        defineField({
          name: 'vectorItem',
          title: 'Vecteur',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Intitulé',
              type: 'string',
              validation: (Rule) => Rule.required().min(6).max(140),
            }),
            defineField({
              name: 'severity',
              title: 'Sévérité',
              type: 'string',
              options: {
                list: [
                  {title: 'Critique', value: 'critical'},
                  {title: 'Élevé', value: 'high'},
                  {title: 'Modéré', value: 'moderate'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Ordre',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(1).max(99),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'severity',
            },
            prepare(selection) {
              const severityMap: Record<string, string> = {
                critical: 'Critique',
                high: 'Élevé',
                moderate: 'Modéré',
              }
              return {
                title: selection.title,
                subtitle: severityMap[selection.subtitle as string] || selection.subtitle,
              }
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Période (A-Z)',
      name: 'periodAsc',
      by: [{field: 'periodLabel', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      period: 'periodLabel',
      published: 'isPublished',
      vectors: 'vectors',
    },
    prepare(selection) {
      const count = Array.isArray(selection.vectors) ? selection.vectors.length : 0
      const status = selection.published ? 'Publié' : 'Brouillon'
      return {
        title: selection.title || 'Vecteurs IA observés',
        subtitle: `${selection.period || 'n/a'} · ${count} vecteurs · ${status}`,
      }
    },
  },
})

