// TODO: РАЗБИТЬ ПО ФАЙЛАМ

export interface Toponym {
  ToponymId: string;
  TypeId: string;
  StyleId: string;
  Address: string;
  ConstructionDate: Date;
  BriefDescription: string;
  Latitude: number;
  Longitude: number;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface Style {
  StyleId: string;
  Name: string;
}

export interface Type {
  TypeId: string;
  Name: string;
}

export interface Photo {
  PhotoId: string;
  ToponymId: string;
  Url: string;
}

export interface NameRecord {
  NameRecordId: string;
  ToponymId: string;
  Name: string;
  EffectiveDateFrom: Date;
  EffectiveDateTo: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface ToponymArchitect {
  ToponymId: string;
  ArchitectId: string;
}

export interface Architect {
  ArchitectId: string;
  Name: string;
}
