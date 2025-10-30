/**
 * $ave+ Icons Module
 * 
 * Centralized exports for all icon-related components and utilities
 */

export {
  SaveplusAnimIcon,
  type SaveplusAnimIconProps
} from './SaveplusAnimIcon';

export {
  getAnimIconData,
  getIconDefinition,
  getAvailableIcons,
  hasIcon,
  type SaveplusIconRecord
} from './saveplus_anim_map';

export {
  useAnimationPreference,
  setAnimationPreference,
  getAnimationPreference
} from '@/hooks/useAnimationPreference';
