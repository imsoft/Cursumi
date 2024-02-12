import { JSXElementConstructor, ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import YouTube from "../components/article/YouTube";
import ArticleImage from "../components/article/ArticleImage";
import Spotify from "../components/article/Spotify";
import { RequiredMetatag } from "@/interfaces";

type Filetree = {
  tree: [
    {
      path: string;
    }
  ];
};

interface Frontmatter {
  title: string;
  description: string;
  keywords: string;
  author: string;
  subject: string;
  date: string;
  type: string;
  source: string;
  image: string;
  url: string;
  robots: string;
  tags: string[];
}

interface BlogPost {
  requiredMetatags: RequiredMetatag;
  content: ReactElement<any, string | JSXElementConstructor<any>>;
}

export const getPostByName = async (
  fileName: string
): Promise<BlogPost | undefined> => {
  const res = await fetch(
    `https://raw.githubusercontent.com/imsoft/The-Gaming-Corps-Blog/main/${fileName}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) return undefined;

  const rawMDX = await res.text();

  if (rawMDX === "404: Not Found") return undefined;

  const { frontmatter, content } = await compileMDX<Frontmatter>({
    source: rawMDX,
    components: {
      YouTube,
      ArticleImage,
      Spotify,
    },
    options: {
      parseFrontmatter: true,
    },
  });

  const id = fileName.replace(/\.mdx$/, "");

  const blogPostObj: BlogPost = {
    requiredMetatags: {
      _id: id,
      title: frontmatter.title,
      date: frontmatter.date,
      tags: frontmatter.tags,
      description: frontmatter.description,
      keywords: frontmatter.keywords,
      author: frontmatter.author,
      subject: frontmatter.subject,
      type: frontmatter.type,
      source: frontmatter.source,
      image: frontmatter.image,
      url: frontmatter.url,
      robots: frontmatter.robots,
    },
    content,
  };

  return blogPostObj;
};

export const getPostsMeta = async (): Promise<
  RequiredMetatag[] | undefined
> => {
  const res = await fetch(
    "https://api.github.com/repos/imsoft/The-Gaming-Corps-Blog/git/trees/main?recursive=1",
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) return undefined;

  const repoFiletree: Filetree = await res.json();

  const filesArray = repoFiletree.tree
    .map((obj) => obj.path)
    .filter((path) => path.endsWith(".mdx"));

  const posts: RequiredMetatag[] = [];

  for (const file of filesArray) {
    const post = await getPostByName(file);
    if (post) {
      const { requiredMetatags } = post;
      posts.push(requiredMetatags);
    }
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getPostsMetaRandom = async (
  numberOfPosts: number
): Promise<RequiredMetatag[] | undefined> => {
  const res = await fetch(
    "https://api.github.com/repos/imsoft/The-Gaming-Corps-Blog/git/trees/main?recursive=1",
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) return undefined;

  const repoFiletree: Filetree = await res.json();

  if (!repoFiletree || !repoFiletree.tree) {
    return undefined;
  }

  const filesArray = repoFiletree.tree
    .map((obj) => obj.path)
    .filter((path) => path.endsWith(".mdx"));

  const posts: RequiredMetatag[] = [];

  for (const file of filesArray) {
    const post = await getPostByName(file);
    if (post) {
      const { requiredMetatags } = post;
      posts.push(requiredMetatags);
    }
  }

  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }

  return posts.slice(0, numberOfPosts);
};
