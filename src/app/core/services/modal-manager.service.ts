// Purpose: Core: Global service for managing modal stacking, body scroll, and z-indexes.
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalManagerService {
  /** Tracks the number of currently open modals across the entire app */
  readonly activeModalsCount = signal(0);

  /** Base z-index for the first modal */
  private readonly BASE_Z_INDEX = 9999;
  
  /** How much to increase the z-index for each nested modal */
  private readonly Z_INDEX_STEP = 50;

  /**
   * Registers a new modal and returns its unique z-index.
   * Locks body scroll if this is the first modal.
   * @returns The calculated z-index for the modal overlay
   */
  registerModal(): number {
    const currentCount = this.activeModalsCount();
    
    if (currentCount === 0) {
      // First modal opened -> lock scroll
      document.body.style.overflow = 'hidden';
    }

    this.activeModalsCount.set(currentCount + 1);
    
    // e.g., Modal 1 = 9999, Modal 2 = 10049, Modal 3 = 10099
    return this.BASE_Z_INDEX + (currentCount * this.Z_INDEX_STEP);
  }

  /**
   * Unregisters a modal. Unlocks body scroll if the last modal is closed.
   */
  unregisterModal(): void {
    const currentCount = this.activeModalsCount();
    
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      this.activeModalsCount.set(newCount);
      
      if (newCount === 0) {
        // Last modal closed -> restore scroll
        document.body.style.overflow = '';
      }
    }
  }
}
