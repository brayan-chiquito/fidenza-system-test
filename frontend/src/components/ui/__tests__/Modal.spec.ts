import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../Modal.vue'

describe('Modal', () => {
  beforeEach(() => {
    // Resetear estilos del body antes de cada test
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // Limpiar después de cada test
    document.body.style.overflow = ''
    // Limpiar solo contenido de Teleport, no todo el body
    const teleportContent = document.body.querySelector('.relative.z-\\[60\\]')
    if (teleportContent) {
      teleportContent.remove()
    }
  })

  it('no debe renderizar cuando isOpen es false', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: false,
      },
      slots: {
        default: '<div>Contenido del modal</div>',
      },
    })

    expect(wrapper.html()).not.toContain('Contenido del modal')
  })

  it('debe renderizar cuando isOpen es true', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
      },
      slots: {
        default: '<div>Contenido del modal</div>',
      },
      attachTo: document.body,
    })

    // Teleport renderiza en body, verificar que el componente se montó
    expect(wrapper.vm).toBeTruthy()
    expect(document.body.innerHTML).toContain('Contenido del modal')
  })

  it('debe mostrar el título cuando se proporciona', () => {
    mount(Modal, {
      props: {
        isOpen: true,
        title: 'Título del Modal',
      },
      attachTo: document.body,
    })

    // Verificar en el DOM real ya que usa Teleport
    expect(document.body.textContent).toContain('Título del Modal')
  })

  it('debe mostrar el botón de cerrar por defecto', () => {
    mount(Modal, {
      props: {
        isOpen: true,
      },
      attachTo: document.body,
    })

    // Verificar en el DOM real
    const closeButton = document.body.querySelector('button')
    expect(closeButton).toBeTruthy()
  })

  it('no debe mostrar el botón de cerrar cuando showCloseButton es false', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        showCloseButton: false,
      },
      attachTo: document.body,
    })

    const closeButton = wrapper.find('button')
    expect(closeButton.exists()).toBe(false)
  })

  it('debe emitir evento close cuando se hace click en el botón de cerrar', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
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
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
      },
      attachTo: document.body,
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('debe bloquear el scroll del body cuando está abierto', async () => {
    mount(Modal, {
      props: {
        isOpen: true,
      },
      attachTo: document.body,
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('debe restaurar el scroll del body cuando se cierra', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
      },
      attachTo: document.body,
    })

    await wrapper.setProps({ isOpen: false })
    await wrapper.vm.$nextTick()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('debe renderizar el contenido del slot', () => {
    mount(Modal, {
      props: {
        isOpen: true,
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

