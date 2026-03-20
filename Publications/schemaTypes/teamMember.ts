import {defineField, defineType} from 'sanity'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Équipe dirigeante',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Identifiant (slug)',
      type: 'string',
      description: 'Identifiant unique, ex: "nidhal", "rania", "wissem". Utilisé pour faire le lien avec le site.',
      validation: (Rule) => Rule.required().regex(/^[a-z0-9-]+$/, { name: 'slug', invert: false }).error('Minuscules et tirets uniquement'),
    }),
    defineField({
      name: 'name',
      title: 'Prénom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Titre / Rôle',
      type: 'string',
      description: 'Ex: "Associé fondateur", "Manager"',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description: 'Photo portrait. Format recommandé : carré, min 400×400px.',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn',
      type: 'url',
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
