# Finance Tracker App - Design Guidelines

## Architecture

### Authentication
**No authentication required.** This is a local-first, single-user finance app with data stored via AsyncStorage. However, include a **Profile/Settings screen** with:
- User-customizable avatar (generate 3 preset avatars with professional, minimal aesthetic)
- Display name field
- App preferences: currency selection, theme toggle, notification settings
- Data management: export data, clear all data (with confirmation)

### Navigation Structure
**Tab Navigation** with 4 tabs + Floating Action Button (FAB):
1. **Home** - Dashboard with monthly summary
2. **Transactions** - Complete transaction history
3. **Budgets** - Budget overview and management
4. **Profile** - Settings and user preferences

**Floating Action Button**: Positioned bottom-right for "Add Transaction" (primary action)

### Navigation Stacks
- Home Stack: Dashboard → Category Details
- Transactions Stack: Transaction List → Transaction Details → Edit Transaction
- Budgets Stack: Budget Overview → Create/Edit Budget
- Profile Stack: Settings → Data Export → About

## Screen Specifications

### 1. Dashboard (Home Tab)
**Purpose**: Monthly financial overview at a glance

**Layout**:
- Transparent header with month selector (left: previous, right: next)
- Scrollable content area
- Safe area insets: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components**:
- Month/Year header with navigation arrows
- Summary cards: Total Income, Total Expenses, Net Balance (card layout with subtle shadows)
- Spending chart (donut chart showing category breakdown)
- Recent transactions list (5 most recent)
- Quick stats: Top spending category, average daily spend

### 2. Transactions Screen
**Purpose**: View, search, and filter all transactions

**Layout**:
- Default navigation header with search bar
- Header right button: Filter icon
- Scrollable list
- Safe area insets: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components**:
- Search bar (in header)
- Date filter chips (Today, Week, Month, Year, Custom)
- Grouped transaction list by date (section headers with dates)
- Transaction cards: category icon, description, amount (color-coded: red for expenses, green for income)
- Empty state: illustration + "No transactions yet"

### 3. Transaction Details (Modal)
**Purpose**: View/edit transaction details

**Layout**:
- Standard modal header with "Edit" button (right)
- Scrollable form content
- Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

**Components**:
- Amount field (large, prominent)
- Category selector (grid of icons)
- Description field
- Date/time picker
- Type toggle (Income/Expense)
- Delete button (bottom, destructive style)

### 4. Add/Edit Transaction (Modal)
**Purpose**: Create or modify transaction

**Layout**:
- Modal header with "Cancel" (left) and "Save" (right, primary color)
- Scrollable form
- Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

**Components**:
- Amount input with currency symbol
- Category picker (horizontal scrollable icon grid)
- Description text field
- Date picker
- Income/Expense segmented control
- Save button (header right)

### 5. Budgets Screen
**Purpose**: Manage spending budgets by category

**Layout**:
- Default header with "Add Budget" button (right: plus icon)
- Scrollable list
- Safe area insets: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components**:
- Overall budget progress card (monthly total)
- Budget cards per category with:
  - Category name and icon
  - Progress bar (color changes: green < 70%, yellow 70-90%, red > 90%)
  - Spent/Total amounts
  - Days remaining in month
- Empty state for no budgets

### 6. Create/Edit Budget (Modal)
**Purpose**: Set spending limits

**Layout**:
- Modal header with "Cancel" and "Save"
- Scrollable form
- Safe area insets: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

**Components**:
- Category selector
- Budget amount input
- Period selector (Monthly, Weekly)
- Alert threshold slider (notify at X%)
- Submit in header

### 7. Profile/Settings Screen
**Purpose**: User preferences and app settings

**Layout**:
- Transparent header with title "Profile"
- Scrollable content
- Safe area insets: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components**:
- Profile card: avatar (tappable to change), display name
- Settings sections:
  - Preferences: Currency, Theme (Light/Dark/Auto)
  - Notifications: Budget alerts toggle
  - Data: Export data, Clear all data
  - About: Version, Privacy policy, Terms
- Clear data requires double confirmation

## Design System

### Color Palette
**Primary Colors**:
- Primary: #2E7D32 (Forest Green - represents growth/savings)
- Primary Light: #4CAF50
- Primary Dark: #1B5E20

**Semantic Colors**:
- Income: #4CAF50 (Green)
- Expense: #F44336 (Red)
- Warning: #FF9800 (Amber - for budget alerts)
- Success: #4CAF50

**Neutral Colors**:
- Background: #FFFFFF (light mode), #121212 (dark mode)
- Surface: #F5F5F5 (light mode), #1E1E1E (dark mode)
- Text Primary: #212121 (light mode), #FFFFFF (dark mode)
- Text Secondary: #757575 (light mode), #B0B0B0 (dark mode)
- Border: #E0E0E0 (light mode), #333333 (dark mode)

### Typography
- **Heading 1**: 28px, Bold (Dashboard totals)
- **Heading 2**: 22px, Semi-Bold (Section headers)
- **Heading 3**: 18px, Semi-Bold (Card titles)
- **Body**: 16px, Regular (Descriptions)
- **Caption**: 14px, Regular (Secondary info, dates)
- **Amount Large**: 32px, Bold (Transaction amounts)

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Component Specifications
**Transaction Cards**:
- White background with border (no shadow)
- Border radius: 12px
- Padding: 16px
- Category icon (left), description + date (center), amount (right)
- Tap feedback: subtle opacity change

**Budget Progress Bars**:
- Height: 8px
- Border radius: 4px
- Animated fill on mount
- Color based on percentage

**Floating Action Button**:
- Size: 56x56px
- Border radius: 28px
- Primary color background
- Plus icon (white)
- Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- Position: bottom-right, 16px from bottom and right edges

**Category Icons**:
- Use Feather icons from @expo/vector-icons
- Size: 24px
- Suggested categories: Shopping (shopping-bag), Food (coffee), Transport (truck), Entertainment (film), Bills (file-text), Healthcare (heart), Salary (dollar-sign), Other (more-horizontal)

## Required Assets
1. **User Avatars** (3 presets):
   - Avatar 1: Minimalist geometric piggy bank silhouette (green/primary color)
   - Avatar 2: Simple line-art wallet icon
   - Avatar 3: Abstract coin stack illustration
   
2. **Empty State Illustrations**:
   - No transactions: Simple illustration of an empty wallet or receipt
   - No budgets: Minimal chart/graph outline

3. **Category Icons**: Use Feather icon set (no custom assets needed)

## Interaction Design
- All buttons have 0.6 opacity on press
- Form inputs show focus state with primary color border
- List items have subtle background change on press (#F5F5F5)
- Swipe-to-delete on transaction items (reveal red delete button)
- Pull-to-refresh on lists
- Smooth transitions between screens (300ms)
- Number inputs show numeric keyboard
- Success feedback after save (brief checkmark animation)

## Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for text
- Accessible labels for all icons
- Support for system font scaling
- VoiceOver/TalkBack support for all interactive elements
- Form validation with clear error messages