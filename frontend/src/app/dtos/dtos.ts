// TODO: РАЗБИТЬ ПО ФАЙЛАМ

export interface TableToponymDto {
  name: string;
  renameYears: number[];
  address: string;
  photoUrl: string;
  type: string;
  style: string;
  architect: string;
  id: string;
  briefDescription: string;
}

export interface RenameRecord {
  name: string;
  year: number;
}

export interface ToponymDto {
  id: string;
  name: string;
  briefDescription: string;
  renameYears: number[];
  renames: RenameRecord[];
  address: string;
  photoUrls: string[];
  type: string[];
  style: string[];
  architect: string[];
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
  address?: string | null;
  name?: string | null;
}
