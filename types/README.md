# TypeScript Types and Interfaces

This directory contains all TypeScript type definitions for the MLM Investment Platform, generated from the Prisma schema.

## File Structure

### `database.types.ts`
Core database types and interfaces matching the Prisma schema:
- **Enums**: All enum types (UserRole, UserStatus, InvestmentProfile, etc.)
- **Interfaces**: All model interfaces (User, Wallet, Investment, Transaction, etc.)
- **Utility Types**: Helper types for API responses, pagination, etc.

### `constants.ts`
Application constants and configuration:
- **Enum Labels**: Human-readable labels for all enums
- **Profile Details**: Investment profile configurations
- **Status Colors**: Color mappings for different statuses
- **Validation Rules**: Validation constants and regex patterns
- **Routes**: Application route definitions
- **API Endpoints**: Backend API endpoint paths

### `utils.types.ts`
Utility types and helper functions:
- **Type Guards**: Functions to check user/investment/transaction states
- **Utility Types**: Generic TypeScript utility types
- **Form Types**: Form state and validation types
- **API Types**: API response and error types
- **Helper Functions**: Formatting and calculation utilities

### `index.ts`
Central export file for convenient imports

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { User, Wallet, Investment } from "@/types";

// Import enums
import { UserStatus, InvestmentProfile } from "@/types";

// Import constants
import { USER_STATUS_LABELS, ROUTES } from "@/types/constants";

// Import utilities
import { isUserActive, formatCurrency } from "@/types/utils.types";
```

### Using Type Guards

```typescript
import { User, isUserActive, canUserInvest } from "@/types";

function handleUser(user: User) {
  if (isUserActive(user)) {
    console.log("User is active");
  }
  
  if (canUserInvest(user)) {
    console.log("User can make investments");
  }
}
```

### Using Enums

```typescript
import { UserStatus, USER_STATUS_LABELS } from "@/types";

const status = UserStatus.ACTIVE;
const label = USER_STATUS_LABELS[status]; // "Active"
```

### Using Constants

```typescript
import { ROUTES, VALIDATION } from "@/types/constants";

// Navigate to dashboard
router.push(ROUTES.DASHBOARD);

// Validate phone number
const isValidPhone = VALIDATION.PHONE_REGEX.test(phoneNumber);
```

### Using Helper Functions

```typescript
import { formatCurrency, formatUSDT, calculateMaturityAmount } from "@/types/utils.types";

// Format currency
const formatted = formatCurrency(10000); // "₹10,000.00"

// Format USDT
const usdtFormatted = formatUSDT(1.23456789); // "1.23456789 USDT"

// Calculate maturity
const maturity = calculateMaturityAmount(100000, 10); // 110000
```

### API Response Types

```typescript
import { ApiResponse, User } from "@/types";

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Usage
const result = await fetchUser("123");
if (result.success && result.data) {
  console.log(result.data.email);
}
```

### Form State Management

```typescript
import { FormState, User } from "@/types";

const [formState, setFormState] = useState<FormState<Partial<User>>>({
  data: {},
  errors: {},
  isSubmitting: false,
  isValid: false,
});
```

### Investment Profile Details

```typescript
import { InvestmentProfile, INVESTMENT_PROFILE_DETAILS } from "@/types";

const profile = InvestmentProfile.GOLD;
const details = INVESTMENT_PROFILE_DETAILS[profile];

console.log(details.name); // "Gold"
console.log(details.minReturn); // 10
console.log(details.maxReturn); // 15
console.log(details.icon); // "🥇"
```

## Type Safety Best Practices

1. **Always use enums instead of string literals**
   ```typescript
   // ✅ Good
   user.status = UserStatus.ACTIVE;
   
   // ❌ Bad
   user.status = "ACTIVE";
   ```

2. **Use type guards for runtime checks**
   ```typescript
   // ✅ Good
   if (isUserActive(user)) { ... }
   
   // ❌ Bad
   if (user.status === "ACTIVE") { ... }
   ```

3. **Leverage utility types for cleaner code**
   ```typescript
   // ✅ Good
   type UserWithWallet = RequireFields<User, "wallet">;
   
   // ❌ Bad
   type UserWithWallet = User & { wallet: Wallet };
   ```

4. **Use constants for validation**
   ```typescript
   // ✅ Good
   if (amount < VALIDATION.MIN_INVESTMENT_AMOUNT) { ... }
   
   // ❌ Bad
   if (amount < 10000) { ... }
   ```

## Updating Types

When the Prisma schema changes:

1. Update `database.types.ts` to match new schema
2. Update enums in `constants.ts` if needed
3. Add new type guards in `utils.types.ts` if needed
4. Update this README with new examples

## Notes

- All monetary values are stored as strings to preserve precision
- Dates can be either `Date` objects or ISO string format
- Use the provided helper functions for formatting and calculations
- All types are exported from the main `index.ts` for convenience
