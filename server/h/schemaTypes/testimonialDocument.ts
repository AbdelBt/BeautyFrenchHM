import { defineType } from 'sanity';

export const testimonialDocument = defineType({
  name: 'testimonialDocument',
  title: 'Testimonial Document',
  type: 'document',
  fields: [
    {
      name: 'quote',
      title: 'Quote',
      type: 'string',
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'authorImage',
      title: 'Author Image',
      type: 'image',
    },
  ],
});
