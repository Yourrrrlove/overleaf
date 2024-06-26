import { EditorProviders } from '../../helpers/editor-providers'
import PdfLogsEntries from '../../../../frontend/js/features/pdf-preview/components/pdf-logs-entries'
import { detachChannel, testDetachChannel } from '../../helpers/detach-channel'
import { FileTreePathContext } from '@/features/file-tree/contexts/file-tree-path'
import { FindResult } from '@/features/file-tree/util/path'
import { FC } from 'react'
import {
  EditorManager,
  EditorManagerContext,
} from '@/features/ide-react/context/editor-manager-context'

describe('<PdfLogsEntries/>', function () {
  const fakeFindEntityResult: FindResult = {
    type: 'doc',
    entity: { _id: '123', name: '123 Doc' },
  }

  const FileTreePathProvider: FC = ({ children }) => (
    <FileTreePathContext.Provider
      value={{
        dirname: cy.stub(),
        findEntityByPath: cy
          .stub()
          .as('findEntityByPath')
          .returns(fakeFindEntityResult),
        pathInFolder: cy.stub(),
        previewByPath: cy.stub(),
      }}
    >
      {children}
    </FileTreePathContext.Provider>
  )

  const EditorManagerProvider: FC = ({ children }) => {
    const value = {
      openDocId: cy.spy().as('openDocId'),
    } as unknown as EditorManager

    return (
      <EditorManagerContext.Provider value={value}>
        {children}
      </EditorManagerContext.Provider>
    )
  }

  const logEntries = [
    {
      file: 'main.tex',
      line: 9,
      column: 8,
      level: 'error',
      message: 'LaTeX Error',
      content: 'See the LaTeX manual',
      raw: '',
      ruleId: 'hint_misplaced_alignment_tab_character',
      key: '',
    },
  ]

  beforeEach(function () {
    cy.interceptCompile()
    cy.interceptEvents()
  })

  it('displays human readable hint', function () {
    cy.mount(
      <EditorProviders>
        <PdfLogsEntries entries={logEntries} />
      </EditorProviders>
    )

    cy.contains('You have placed an alignment tab character')
  })

  it('opens doc on click', function () {
    cy.mount(
      <EditorProviders
        providers={{ EditorManagerProvider, FileTreePathProvider }}
      >
        <PdfLogsEntries entries={logEntries} />
      </EditorProviders>
    )

    cy.findByRole('button', {
      name: 'Navigate to log position in source code: main.tex, 9',
    }).click()

    cy.get('@findEntityByPath').should('have.been.calledOnceWith', 'main.tex')
    cy.get('@openDocId').should(
      'have.been.calledOnceWith',
      fakeFindEntityResult.entity._id,
      {
        gotoLine: 9,
        gotoColumn: 8,
        keepCurrentView: false,
      }
    )
  })

  it('opens doc via detached action', function () {
    cy.window().then(win => {
      win.metaAttributesCache.set('ol-detachRole', 'detacher')
    })

    cy.mount(
      <EditorProviders
        providers={{ EditorManagerProvider, FileTreePathProvider }}
      >
        <PdfLogsEntries entries={logEntries} />
      </EditorProviders>
    ).then(() => {
      testDetachChannel.postMessage({
        role: 'detached',
        event: 'action-sync-to-entry',
        data: {
          args: [
            {
              file: 'main.tex',
              line: 7,
              column: 6,
            },
          ],
        },
      })
    })

    cy.get('@findEntityByPath').should('have.been.calledOnce')
    cy.get('@openDocId').should(
      'have.been.calledOnceWith',
      fakeFindEntityResult.entity._id,
      {
        gotoLine: 7,
        gotoColumn: 6,
        keepCurrentView: false,
      }
    )
  })

  it('sends open doc clicks via detached action', function () {
    cy.window().then(win => {
      win.metaAttributesCache.set('ol-detachRole', 'detached')
    })

    cy.mount(
      <EditorProviders
        providers={{ EditorManagerProvider, FileTreePathProvider }}
      >
        <PdfLogsEntries entries={logEntries} />
      </EditorProviders>
    )

    cy.spy(detachChannel, 'postMessage').as('postDetachMessage')

    cy.findByRole('button', {
      name: 'Navigate to log position in source code: main.tex, 9',
    }).click()

    cy.get('@findEntityByPath').should('not.have.been.called')
    cy.get('@openDocId').should('not.have.been.called')
    cy.get('@postDetachMessage').should('have.been.calledWith', {
      role: 'detached',
      event: 'action-sync-to-entry',
      data: {
        args: [
          {
            file: 'main.tex',
            line: 9,
            column: 8,
          },
        ],
      },
    })
  })
})
