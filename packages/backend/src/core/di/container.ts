/**
 * Dependency Injection Container
 * Simple factory-based DI for registering and resolving dependencies
 */

type Factory<T> = () => T
type Constructor<T = any> = new (...args: any[]) => T

class DIContainer {
  private factories = new Map<string, Factory<any>>()
  private singletons = new Map<string, any>()

  /**
   * Register a factory function for a dependency
   */
  register<T>(key: string | Constructor<T>, factory: Factory<T>, singleton = false): void {
    const id = typeof key === 'string' ? key : key.name

    if (singleton) {
      this.factories.set(id, () => {
        if (!this.singletons.has(id)) {
          this.singletons.set(id, factory())
        }
        return this.singletons.get(id)
      })
    } else {
      this.factories.set(id, factory)
    }
  }

  /**
   * Register a singleton instance directly
   */
  registerSingleton<T>(key: string | Constructor<T>, instance: T): void {
    const id = typeof key === 'string' ? key : key.name
    this.singletons.set(id, instance)
    this.factories.set(id, () => instance)
  }

  /**
   * Resolve a dependency by key or constructor
   */
  resolve<T>(key: string | Constructor<T>): T {
    const id = typeof key === 'string' ? key : key.name

    const factory = this.factories.get(id)
    if (!factory) {
      throw new Error(`[DI Container] No factory registered for: ${id}`)
    }

    return factory()
  }

  /**
   * Check if a dependency is registered
   */
  has(key: string | Constructor): boolean {
    const id = typeof key === 'string' ? key : key.name
    return this.factories.has(id)
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.factories.clear()
    this.singletons.clear()
  }

  /**
   * Get all registered keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.factories.keys())
  }
}

/**
 * Global container instance
 */
export const container = new DIContainer()

/**
 * Helper to create a new isolated container (for testing)
 */
export function createContainer(): DIContainer {
  return new DIContainer()
}
