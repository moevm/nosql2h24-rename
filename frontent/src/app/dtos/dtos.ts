// TODO: РАЗБИТЬ ПО ФАЙЛАМ

export interface ToponymDto {
  name: string;
  renameYears: number[];
  address: string;
  photoUrl: string;
  type: string;
  style: string;
  architect: string;
}

export interface FilterDto {
  type?: string[] | null;
  style?: string[] | null;
  hasPhoto?: boolean | null;
  architect?: string | null;
  renamedDateFrom?: number | null;
  renamedDateTo?: number | null;
  cardSearch?: string | null;
  constructionDateFrom?: number | null;
  constructionDateTo?: number | null;
  page?: number | null;
}
