import { readdirSync, readFileSync } from 'fs';
import path, { join } from 'path';
import matter from 'gray-matter';
import { bundleMDX } from 'mdx-bundler';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import { ChooseFrontmatter, CodeFrontmatterResult, ContentType, ResultFrontmatter } from '~/types/frontmatter';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export function getPostSlugs(type: ContentType) {
    return readdirSync(join(process.cwd(), 'contents', type))
}

/**
 *
 * @param type
 * @param slug
 * @returns
 */
export async function getPostBySlug(type: ContentType = 'blog', slug: string): Promise<CodeFrontmatterResult> {
    // get mdx file from contents folder
    const source = slug
        ? readFileSync(join(process.cwd(), 'contents', type, `${slug}.mdx`), 'utf8')
        : readFileSync(
            join(process.cwd(), 'src', 'contents', `${type}.mdx`),
            'utf8'
        );

    // get code and frontmatter from bundleMDX
    const { code, frontmatter } = await bundleMDX({
        source,
        xdmOptions(options) {
            options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
            options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypePrism, rehypeSlug, rehypeAutolinkHeadings]

            return options
        }
    });

    return {
        code,
        frontmatter,
    };
}

/**
 * 
 * @param type 
 * @returns 
 */
export async function getAllPost(type: ContentType) {
    const files = getPostSlugs(type)

    return files.map(item => {
        const source = readFileSync(join(process.cwd(), "contents", type, item), "utf-8")

        const { data } = matter(source)

        const res: ResultFrontmatter<typeof type> =
        {
            ...(data as ChooseFrontmatter<"blog">),
            publishedAt: (data as ChooseFrontmatter<"blog">).publishedAt,
            slug: item.replace(".mdx", ""),
            readingTime: readingTime(source)
        }


        return res;
    })
}

export async function getFeatured(type: ContentType) {
    const files = getPostSlugs(type)
    const featuredContent = []

    for (let i = 0; i < 3; i++) {
        const source = readFileSync(join(process.cwd(), "contents", type, files[i]), "utf-8")

        const { data } = matter(source)

        const res: ResultFrontmatter<typeof type> =
        {
            ...(data as ChooseFrontmatter<typeof type>),
            slug: files[i].replace(".mdx", ""),
            readingTime: readingTime(source)
        }

        featuredContent.push(res)
    }

    return featuredContent

}
