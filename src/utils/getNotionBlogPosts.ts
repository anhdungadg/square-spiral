import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { marked } from "marked";

const notion = new Client({ auth: import.meta.env.NOTION_API_SECRET });
const databaseId = import.meta.env.NOTION_DATABASE_ID;
let cachedPosts: CollectionEntry<"blogs">[] | null = null;

export async function getAllBlogPosts(): Promise<CollectionEntry<"blogs">[]> {
    // console.log('NOTION_API_SECRET1', import.meta.env.NOTION_API_SECRET);
    //   if (cachedPosts) return cachedPosts;
    if (cachedPosts) {
        console.log('cachedPosts');
        return cachedPosts;
    }
    try {
        console.log('notion.databases');
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "Published",
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: "PublishedDate",
                    direction: "descending",
                },
            ],
        });
        const posts = response.results.map((page: any) => ({
            // pageokela:page.properties.Text.rich_text[0],
            id: page.id,
            // slug: page.properties.slug.rich_text[0].plain_text,
            // title: page.properties.title.title[0].plain_text,
            // description: page.properties.description.rich_text[0].plain_text,
            // pubDatetime: new Date(page.properties.pubDatetime.date.start),
            // modDatetime: new Date(page.last_edited_time),
            // author: page.properties.author.rich_text[0].plain_text,
            // featured: page.properties.featured.checkbox,
            // draft: page.properties.draft.checkbox,
            // tags: page.properties.tags.multi_select.map((tag: any) => tag.name),
            slug: page.properties.Slug.rich_text[0].plain_text,
            // title: page.properties.Title.rich_text[0].plain_text,
            description: page.properties.Text.rich_text[0].plain_text,
            pubDate: new Date(page.properties.PublishedDate.date.start),
            updateDate: new Date(page.last_edited_time),
            author: page.properties.author,
            // featured: page.properties.featured.checkbox,
            draft: page.properties.Published.checkbox,
            // tags: page.properties.tags.multi_select.map((tag: any) => tag.name),
        }));
        console.log('posts', posts);
        cachedPosts = posts;
        return posts;
    } catch (error) {
        console.error("Error fetching blog posts from Notion:", error);
        throw error;
    }
}


const n2m = new NotionToMarkdown({ notionClient: notion });
export async function getPostContent(id: string) {
    console.log('postId', id);
    const mdblocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const parsedContent = await marked.parse(mdString.parent);
    console.log('parsedContent', parsedContent);
    return parsedContent;
}
