export interface Colonna {
  nome: string;
  tipo: string;
}

export interface Tabella {
  nome: string;
  colonne: Colonna[];
}

export interface Relazione {
  tabellaOrigine: string;
  tabellaDestinazione: string;
  chiaveOrigine: string;
  chiaveDestinazione: string;
}

export interface Database {
  tabelle: Tabella[];
  relazioni: Relazione[];
}