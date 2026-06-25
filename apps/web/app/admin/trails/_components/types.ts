export interface ExistingImage {
  id: number;
  url: string;
}

export interface NewImage {
  key: string;
  file: File;
  previewUrl: string;
}

export type FormImage =
  | {
      kind: "existing";
      image: ExistingImage;
    }
  | {
      kind: "new";
      image: NewImage;
    };
