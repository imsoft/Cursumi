export interface IBlogCard {
  id: number;
  blogTitle: string;
  blogHref: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  category: Category;
  author: Author;
}

export interface Author {
  name: string;
  role: string;
  href: string;
  authorImageUrl: string;
}

export interface Category {
  categoryTitle: string;
  categoryHref: string;
}
