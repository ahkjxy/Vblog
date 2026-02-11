#!/bin/bash

# Script to fix all supabase imports from 'supabase' to 'createClient'

# List of files to fix
files=(
  "src/app/dashboard/users/page.tsx"
  "src/app/dashboard/posts/new/page.tsx"
  "src/app/dashboard/posts/[id]/edit/page.tsx"
  "src/app/dashboard/posts/[id]/review/page.tsx"
  "src/components/editor/MediaLibraryModal.tsx"
  "src/components/dashboard/QuickReviewActions.tsx"
  "src/components/dashboard/FeedbackManagement.tsx"
  "src/components/dashboard/LogoutButton.tsx"
  "src/components/Comments.tsx"
  "src/components/CustomerSupport.tsx"
  "src/contexts/UserContext.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace import statement
    sed -i.bak "s/import { supabase } from '@\/lib\/supabase\/client'/import { createClient } from '@\/lib\/supabase\/client'/g" "$file"
    # Remove backup file
    rm -f "$file.bak"
  fi
done

echo "Done! All imports updated."
