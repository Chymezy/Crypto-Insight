export interface NewsItem {
  id: string;
  guid: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  tags: string;
  categories: string;
  upvotes: string;
  downvotes: string;
  lang: string;
  source_info: {
    name: string;
    img: string;
    lang: string;
  };
  source: string;
}

export interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: NewsItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}
