// Export all models and their interfaces
export { default as Prompt } from './prompt';
export type { PromptData, PromptInsert, PromptUpdate } from './prompt';

export { default as Collection } from './collection';
export type { CollectionData, CollectionInsert, CollectionUpdate } from './collection';

export { default as CollectionPrompts } from './collectionPrompts';
export type { CollectionPromptsData } from './collectionPrompts';

export { default as UsersPrompts } from './usersPrompts';
export type { UsersPromptsData } from './usersPrompts';

export type { UserData } from './user';