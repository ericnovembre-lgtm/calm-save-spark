/**
 * $ave+ Icons Module
 * 
 * Centralized exports for all icon-related components and utilities
 */

export {
  SaveplusAnimIcon,
  SaveplusAnimIconDecorative,
  SaveplusAnimIconStatic,
  type SaveplusAnimIconProps
} from './SaveplusAnimIcon';

export {
  saveplusAnimMap,
  getIconDefinition,
  getAvailableIcons,
  hasIcon,
  type IconAsset,
  type IconDefinition
} from './saveplus_anim_map';

export {
  useAnimationPreference,
  setAnimationPreference,
  getAnimationPreference
} from '@/hooks/useAnimationPreference';
