---
    layout: blog
    title: Branden Builds Website Launch
    tags: 
        - svelte
        - blog
    date: 2021-08-03
    image: branden-builds-website-blog.png
    id: b1
    excerpt: Branden Builds has officially launched and I'm very excited to show the world. 
    slug: branden-builds-launches
    keywords: branding, website launch, svelte, branden builds, freelance web developer, frontend developer
---

<script>
  //TODO: Find a better way to handle dynamic images so I can refactor into blog layout
  import FeaturedImageObj from "../../../static/images/blog/branden-builds-launches/branden-builds-website-blog.png?&format=webp&srcset"
  import FeaturedImage from "$lib/FeaturedImage.svelte"
  import BlogHeader from "$lib/BlogHeader.svelte"

</script>


<FeaturedImage src={FeaturedImageObj} alt={title} />
<BlogHeader rawDate={date} {title} {tags} />

I am excited to announced that I have officially launched my new website and blog. This project gave me a chance to try out some new tech I've been eager to learn.

## Branden Builds Branding

I reached out to a previous coworker and awesome friend, Mister Munn, who does phenomenal [identity branding services](http://mistermunn.com/). 

## The Website Stack

### Sveltekit

I've been hearing the help on Svelte and was eager to try a new framework. I love React and Vue, but always game to learn some new tech.  I decided on Svelte after running through a tutorial and loved how easy and simple it was to include use popular frontend techniques like reactivity and routing. 

I ran through Gatsby and loved it as well, which I used over at my [digital nomad blog](https://byoungz.com) and didn't really have any complaints. I just honestly wanted to play with some new tech.

### WindiCSS

[WindiCSS](https://windicss.org/guide/) is very similar to Tailwind as in it's built off Tailwinds utility first approach. The difference, which is why WindiCSS claims to be faster than Tailwind, is it is a standalone compiler for Tailwind that generates classes on demand. 

### mdsvex

If you're familiar with MDX, this is [Svelte's version](https://mdsvex.com/) of this. I wanted to create my blog posts in markdown so I can have them on Github and anyone can edit and submit PRs on them. It also just seemed overkill to use a full on CMS like I did with my other blog. 

### Vite Image Tools

I wanted a tool similar to Gatsby Image that handles optimization, srcset, and other modern image techniques for my images. I found [Vite Image Tools](https://github.com/JonasKruckenberg/imagetools/tree/main/packages/vite) after looking around Discord and a Reddit post. 

## Pain Points

**Image handling** in svelte/svelte kit is not a great experience yet. The biggest issue for me, especially after being spoiled with GatsbyImage, is a way to dynamically use images in Vite Image Tools. Vite Image Tools is awesome, but uses an import statement which means no template literals so I have to hard code in each image for my blog. This is gonna be a focus point in next iteration of my blog.

