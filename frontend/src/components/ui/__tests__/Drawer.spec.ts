import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Drawer from '../Drawer.vue'

describe('Drawer', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
    // Limpiar solo contenido de Teleport
    const teleportContent = document.body.querySelector('.relative.z-50')
    if (teleportContent) {
      teleportContent.remove()
    }
  })

  it('no debe renderizar cuando isOpen es false', () => {
    const wrapper = mount(Drawer, {
      props: {
        isOpen: false,
        title: 'Drawer Title',
      },
      slots: {
        default: '<div>Contenido del drawer</div>',
      },
    })

    expect(wrapper.html()).not.toContain('Drawer Title')
  })

  it('debe renderizar cuando isOpen es true', () => {
    mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Drawer Title',
      },
      slots: {
        default: '<div>Contenido del drawer</div>',
      },
      attachTo: document.body,
    })

    // Verificar en el DOM real ya que usa Teleport
    expect(document.body.textContent).toContain('Drawer Title')
    expect(document.body.textContent).toContain('Contenido del drawer')
  })

  it('debe mostrar el título', () => {
    mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Mi Drawer',
      },
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('Mi Drawer')
  })

  it('debe emitir evento close cuando se hace click en el botón de cerrar', async () => {
    const wrapper = mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Drawer Title',
      },
      attachTo: document.body,
    })

    // Buscar el botón en el DOM real
    const closeButton = document.body.querySelector('button')
    expect(closeButton).toBeTruthy()
    
    if (closeButton) {
      closeButton.dispatchEvent(new Event('click'))
      await wrapper.vm.$nextTick()
    }

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('debe emitir evento close cuando se presiona Escape', async () => {
    const wrapper = mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Drawer Title',
      },
      attachTo: document.body,
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('debe bloquear el scroll del body cuando está abierto', async () => {
    mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Drawer Title',
      },
      attachTo: document.body,
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('debe renderizar el contenido del slot', () => {
    mount(Drawer, {
      props: {
        isOpen: true,
        title: 'Drawer Title',
      },
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
      attachTo: document.body,
    })

    // Verificar en el DOM real
    const content = document.body.querySelector('.test-content')
    expect(content).toBeTruthy()
    expect(document.body.textContent).toContain('Test Content')
  })
})

