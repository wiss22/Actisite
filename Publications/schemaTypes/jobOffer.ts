import {defineField, defineType} from 'sanity'

export const jobOfferType = defineType({
  name: 'jobOffer',
  title: 'Postes ouverts',
  type: 'document',
  groups: [
    {name: 'editorial', title: 'Editorial'},
    {name: 'content', title: 'Contenu'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Intitulé du poste',
      type: 'string',
      group: 'editorial',
      validation: (Rule) => Rule.required().min(5).max(120),
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
          {title: 'Ouvert', value: 'open'},
          {title: 'Fermé', value: 'closed'},
          {title: 'Brouillon', value: 'draft'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Pôle',
      type: 'string',
      group: 'editorial',
      initialValue: 'Cybersecurity Consulting',
    }),
    defineField({
      name: 'location',
      title: 'Localisation',
      type: 'string',
      group: 'editorial',
      initialValue: 'Paris 6e / Hybride',
    }),
    defineField({
      name: 'contractType',
      title: 'Type de contrat',
      type: 'string',
      group: 'editorial',
      options: {
        list: [
          {title: 'CDI', value: 'CDI'},
          {title: 'Stage', value: 'Stage'},
          {title: 'Alternance', value: 'Alternance'},
          {title: 'Freelance', value: 'Freelance'},
        ],
      },
      initialValue: 'CDI',
    }),
    defineField({
      name: 'experienceLevel',
      title: "Niveau d'expérience",
      type: 'string',
      group: 'editorial',
      initialValue: '2-5 ans',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      group: 'editorial',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.required().min(40).max(320),
    }),
    defineField({
      name: 'positionDescription',
      title: 'Description complète du poste',
      type: 'array',
      of: [{type: 'block'}],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'missions',
      title: 'Missions (optionnel)',
      type: 'array',
      of: [{type: 'string'}],
      group: 'content',
    }),
    defineField({
      name: 'skills',
      title: 'Compétences clés (optionnel)',
      type: 'array',
      of: [{type: 'string'}],
      group: 'content',
      options: {layout: 'tags'},
    })
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
      subtitle: 'status',
      dept: 'department',
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `${selection.dept || 'Actinuance'} · ${selection.subtitle || 'draft'}`,
      }
    },
  },
})
