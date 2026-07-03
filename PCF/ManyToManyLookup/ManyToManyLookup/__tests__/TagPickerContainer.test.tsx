import '@testing-library/jest-dom';
import * as React from 'react';
import { render, act } from '@testing-library/react';
import { IContextExtended } from '../types';

// Mock TagView so we can capture the props passed to it and invoke callbacks directly.
jest.mock('../components/TagView', () => ({ TagView: jest.fn() }));

import { TagPickerContainer } from '../components/TagPickerContainer';
import { TagView } from '../components/TagView';

const MockTagView = TagView as jest.MockedFunction<typeof TagView>;

// fetch mock
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

function makeRecord(values: Record<string, string> | string) {
    const recordValues = typeof values === 'string' ? { name: values } : values;
    return { getValue: (field: string) => recordValues[field] ?? null };
}

function makeContext(
    recordIds: string[] = [],
    recordMap: Record<string, any> = {},
    primaryNameAttribute = 'name',
    nameField: string | null = null,
): IContextExtended {
    return {
        parameters: {
            nameField: {
                raw: nameField,
            },
            records: {
                sortedRecordIds: recordIds,
                records: recordMap,
                getTargetEntityType: jest.fn().mockReturnValue('contact'),
                refresh: jest.fn(),
            } as any,
        },
        utils: {
            getEntityMetadata: jest.fn().mockImplementation((entityName: string) =>
                Promise.resolve({ EntitySetName: `${entityName}s`, PrimaryNameAttribute: primaryNameAttribute })
            ),
            lookupObjects: jest.fn().mockResolvedValue([]),
        } as any,
        navigation: {
            openForm: jest.fn().mockResolvedValue({}),
        } as any,
        page: {
            entityId: 'page-id-001',
            entityTypeName: 'account',
            getClientUrl: () => 'https://test.crm.dynamics.com',
        },
    } as unknown as IContextExtended;
}

// Capture the latest props passed to the mocked TagView.
let capturedProps: React.ComponentProps<typeof TagView>;

beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    MockTagView.mockImplementation((props) => {
        capturedProps = props;
        return null as unknown as React.ReactElement;
    });
});

describe('TagPickerContainer', () => {
    describe('tag display', () => {
        it('passes selected tags derived from context records', async () => {
            const context = makeContext(
                ['id-1', 'id-2'],
                { 'id-1': makeRecord('Alice'), 'id-2': makeRecord('Bob') }
            );
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            expect(capturedProps.tags).toEqual([
                { id: 'id-1', name: 'Alice' },
                { id: 'id-2', name: 'Bob' },
            ]);
        });

        it('uses the related table primary name attribute for tag labels', async () => {
            const context = makeContext(
                ['id-1', 'id-2'],
                {
                    'id-1': makeRecord({ fm_displayname: 'Primary Alice', name: 'Fallback Alice' }),
                    'id-2': makeRecord({ fm_displayname: 'Primary Bob', name: 'Fallback Bob' }),
                },
                'fm_displayname'
            );
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            expect(capturedProps.tags).toEqual([
                { id: 'id-1', name: 'Primary Alice' },
                { id: 'id-2', name: 'Primary Bob' },
            ]);
        });

        it('uses configured nameField before the related table primary name attribute', async () => {
            const context = makeContext(
                ['id-1'],
                { 'id-1': makeRecord({ fm_customlabel: 'Configured Label', fm_displayname: 'Primary Label' }) },
                'fm_displayname',
                'fm_customlabel'
            );
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            expect(capturedProps.tags).toEqual([{ id: 'id-1', name: 'Configured Label' }]);
        });

        it('passes empty tags when no records exist', async () => {
            await act(async () => {
                render(<TagPickerContainer context={makeContext()} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            expect(capturedProps.tags).toEqual([]);
        });
    });

    describe('add record (lookupObjects)', () => {
        it('calls lookupObjects and associates each returned record', async () => {
            const context = makeContext();
            (context.utils.lookupObjects as jest.Mock).mockResolvedValue([
                { id: 'new-record-id', name: 'New Contact', entityType: 'contact' },
            ]);
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            await act(async () => { await capturedProps.onOpen(); });
            expect(context.utils.lookupObjects).toHaveBeenCalledWith(expect.objectContaining({
                allowMultiSelect: true,
                entityTypes: ['contact'],
            }));
            expect(mockFetch).toHaveBeenCalledWith(
                'https://test.crm.dynamics.com/api/data/v9.2/accounts(page-id-001)/account_contacts/$ref',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ '@odata.id': 'https://test.crm.dynamics.com/api/data/v9.2/contacts(new-record-id)' }),
                })
            );
            expect(context.parameters.records.refresh).toHaveBeenCalled();
        });

        it('skips records that are already selected', async () => {
            const context = makeContext(['already-id'], { 'already-id': makeRecord('Existing') });
            (context.utils.lookupObjects as jest.Mock).mockResolvedValue([
                { id: 'already-id', name: 'Existing', entityType: 'contact' },
            ]);
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            await act(async () => { await capturedProps.onOpen(); });
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('does nothing when lookup is cancelled (empty result)', async () => {
            const context = makeContext();
            (context.utils.lookupObjects as jest.Mock).mockResolvedValue([]);
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            await act(async () => { await capturedProps.onOpen(); });
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('navigate to record', () => {
        it('calls context.navigation.openForm with correct entity and id', async () => {
            const context = makeContext(['id-1'], { 'id-1': makeRecord('Alice') });
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            act(() => { capturedProps.onNavigate('id-1'); });
            expect(context.navigation.openForm).toHaveBeenCalledWith({
                entityName: 'contact',
                entityId: 'id-1',
            });
        });
    });

    describe('remove record', () => {
        it('calls the disassociate $ref endpoint with correct URL', async () => {
            const context = makeContext(['id-1'], { 'id-1': makeRecord('Alice') });
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="account_contacts" targetEntityType="contact" />);
            });
            await act(async () => {
                await capturedProps.onRemove({} as React.MouseEvent<HTMLButtonElement>, { value: 'id-1' });
            });
            expect(mockFetch).toHaveBeenCalledWith(
                'https://test.crm.dynamics.com/api/data/v9.2/accounts(page-id-001)/account_contacts(id-1)/$ref',
                expect.objectContaining({ method: 'DELETE' })
            );
            expect(context.parameters.records.refresh).toHaveBeenCalled();
        });

        it('does not call fetch when relationshipName is empty', async () => {
            const context = makeContext(['id-1'], { 'id-1': makeRecord('Alice') });
            await act(async () => {
                render(<TagPickerContainer context={context} relationshipName="" targetEntityType="contact" />);
            });
            await act(async () => {
                await capturedProps.onRemove({} as React.MouseEvent<HTMLButtonElement>, { value: 'id-1' });
            });
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });
});
