# CONTINUITY – FE USER (pet-store-1-0-0)

## Goal (incl. success criteria)
- Implement and maintain FE user features for PetConnect.
- UI and flows match the approved product spec.
- Builds and tests pass for FE user.
- Update org/center profile UI, follow-only interactions, group search/detail feeds, and group post notifications.
- Show verified org/center badge, disable friend actions for org/center, and support follow-only visibility.

## Constraints / Assumptions
- Scope limited to FE user only.
- Backend changes are allowed only if explicitly required for FE user.
- Must not affect admin or mobile UI.

## Key decisions
- FE user code lives exclusively in `pet-store-1-0-0/`.

## State
- Done:
    - Initial project structure understood.
- Now:
    - Planning FE user org/center profile changes and group/community discovery/feed updates.
- Next:
    - Confirm backend data fields for verified org, follow-only behavior, and group posts visibility.

## Open questions (UNCONFIRMED if needed)
- UNCONFIRMED: What backend field indicates org/center verification status for the avatar badge?

## Working set (files / directories)
- pet-store-1-0-0/
