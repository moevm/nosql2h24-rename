// TODO: РАЗБИТЬ ПО ФАЙЛАМ

export interface ToponymDto {
  name: string;
  renameYears: Date[];
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
  renamedTo?: string | null;
  cardSearch?: string | null;
  constructionDateFrom?: number | null;
  constructionDateTo?: number | null;
}
