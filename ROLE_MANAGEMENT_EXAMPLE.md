// Example usage of the new efficient user roles system

import { useApp } from '@/contexts/appContext'

export function ExampleUsage() {
  const { actions, utils, state } = useApp()

  // ✅ Set user roles efficiently - Single prompt role
  const handleSetPromptRole = (promptId: string, role: "owner" | "buyer" | "collaborator") => {
    actions.setPromptRole(promptId, role)
  }

  // ✅ Set user roles efficiently - Single collection role
  const handleSetCollectionRole = (collectionId: string, role: "owner" | "buyer" | "collaborator") => {
    actions.setCollectionRole(collectionId, role)
  }

  // ✅ Set user roles efficiently - Batch multiple roles
  const handleSetBatchRoles = () => {
    actions.setBatchRoles({
      prompts: {
        'prompt-id-1': 'owner',
        'prompt-id-2': 'buyer',
        'prompt-id-3': 'collaborator'
      },
      collections: {
        'collection-id-1': 'owner',
        'collection-id-2': 'buyer'
      }
    })
  }

  // ✅ Set user roles efficiently - Update all roles at once
  const handleSetAllUserRoles = () => {
    actions.setUserRoles({
      prompts: {
        'prompt-id-1': 'owner',
        'prompt-id-2': 'buyer'
      },
      collections: {
        'collection-id-1': 'owner'
      }
    })
  }

  // ✅ Check user roles efficiently
  const checkUserRoles = (promptId: string, collectionId: string) => {
    // Check if user has specific role
    const isOwner = utils.hasPromptRole(promptId, 'owner')
    const isBuyer = utils.hasPromptRole(promptId, 'buyer')
    const isCollaborator = utils.hasPromptRole(promptId, 'collaborator')
    
    // Get user's role
    const promptRole = utils.getPromptRole(promptId)
    const collectionRole = utils.getCollectionRole(collectionId)
    
    console.log({
      isOwner,
      isBuyer,
      isCollaborator,
      promptRole,
      collectionRole
    })
  }

  // ✅ The system automatically loads all user relationships efficiently
  // This happens when the user logs in and includes:
  // - User prompts
  // - User collections  
  // - Favorite prompts
  // - Favorite collections
  // - All user roles for prompts and collections
  // All in just 2 database queries instead of multiple separate queries

  return (
    <div>
      <h2>User Roles Management</h2>
      <p>User roles are loaded efficiently and can be managed through the context actions.</p>
      
      {/* Example of checking current user's role */}
      {state.user && (
        <div>
          <h3>Current User Roles:</h3>
          <pre>{JSON.stringify(state.userRoles, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// ✅ Key Benefits of this implementation:

// 1. **Super Efficient Database Queries**: 
//    - Only 2 database queries to load all user relationships
//    - Previous implementation would make separate queries for each relationship type

// 2. **Fast Role Updates**: 
//    - Instant UI updates when roles change
//    - No need to refetch data from server

// 3. **Multiple Ways to Set Roles**:
//    - Single prompt/collection role updates
//    - Batch role updates
//    - Complete role replacement

// 4. **Utility Functions for Role Checking**:
//    - hasPromptRole() - Check if user has specific role
//    - hasCollectionRole() - Check if user has specific role
//    - getPromptRole() - Get user's current role
//    - getCollectionRole() - Get user's current role

// 5. **Automatic Integration**:
//    - Roles are loaded automatically when user logs in
//    - All existing utility functions (isOwner, canEdit, etc.) use the cached roles
//    - No changes needed to existing components

// 6. **Type Safety**:
//    - Full TypeScript support
//    - Proper role type definitions
//    - IntelliSense support
