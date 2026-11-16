import {defineField, defineType} from 'sanity'

const tagList = [
  {title: 'Offre', value: 'Offre'},
  {title: 'Expertise', value: 'Expertise'},
  {title: 'Actualité', value: 'Actualité'},
  {title: 'Publication', value: 'Publication'},
  {title: 'Événement', value: 'Événement'},
]

// Actus de l'encart « À la une » du haut de la page d'accueil (colonne de droite, masquée
// sur mobile). L'encart est un carrousel qui affiche uniquement les entrées saisies ici,
// quatre au plus : sans entrée, ou sans ce document, il n'apparaît pas. Le site lit le
// document publié le plus récemment modifié.
export const homeFeaturedType = defineType({
  name: 'homeFeatured',
  title: 'À la une (accueil)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nom interne',
      description: 'Sert uniquement à retrouver ce document dans le Studio.',
      type: 'string',
      initialValue: 'À la une',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'isPublished',
      title: 'Afficher la rubrique « À la une » sur l’accueil',
      description: 'Désactivé : toute la rubrique disparaît de la page d’accueil. Activé : elle affiche uniquement les actus ci-dessous ; sans aucune actu, elle reste masquée.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'items',
      title: 'Actus du carrousel (4 maximum)',
      type: 'array',
      validation: (Rule) => Rule.max(4),
      of: [
        defineField({
          name: 'featuredItem',
          title: 'Entrée',
          type: 'object',
          fields: [
            defineField({
              name: 'tag',
              title: 'Type',
              type: 'string',
              options: {list: tagList, layout: 'radio'},
              initialValue: 'Actualité',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Titre',
              type: 'string',
              validation: (Rule) => Rule.required().min(3).max(48),
            }),
            defineField({
              name: 'description',
              title: 'Description (une ligne)',
              type: 'string',
              validation: (Rule) => Rule.max(90),
            }),
            defineField({
              name: 'image',
              title: 'Photo',
              description: 'Image d’illustration affichée en haut de l’actu dans le carrousel (format paysage conseillé). Facultative.',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({
              name: 'url',
              title: 'Lien',
              description: 'Page du site (ex. /cyber-4-ai) ou adresse complète en https://',
              type: 'string',
              validation: (Rule) =>
                Rule.required().custom((value) =>
                  typeof value === 'string' && /^(\/(?!\/)|https:\/\/)/.test(value)
                    ? true
                    : 'Le lien doit commencer par / ou par https://',
                ),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'tag', media: 'image'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', published: 'isPublished', items: 'items'},
    prepare(selection) {
      const count = Array.isArray(selection.items) ? selection.items.length : 0
      const status = selection.published ? 'Rubrique affichée' : 'Rubrique masquée'
      return {
        title: selection.title || 'À la une',
        subtitle: `${count} entrée${count > 1 ? 's' : ''} · ${status}`,
      }
    },
  },
})
