import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { initializeIcons } from '@fluentui/react';
import { TagView } from '../components/TagView';

initializeIcons(undefined, { disableWarnings: true });

const noop = () => undefined;
const defaultProps = {
    tags: [],
    onOpen: noop,
    onRemove: noop as any,
    onNavigate: noop,
    loading: false,
    addMoreText: "Add more",
};

describe('TagView', () => {
    it('renders without tags or spinner', () => {
        const { container } = render(<TagView {...defaultProps} />);
        expect(screen.queryByLabelText(/^Remove /)).toBeNull();
        expect(container.querySelector('.ms-Spinner')).toBeNull();
    });

    it('renders each tag name', () => {
        render(<TagView {...defaultProps} tags={[{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('renders a dismiss button for every tag', () => {
        render(<TagView {...defaultProps} tags={[{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }]} />);
        expect(screen.getByLabelText('Remove Alpha')).toBeInTheDocument();
        expect(screen.getByLabelText('Remove Beta')).toBeInTheDocument();
    });

    it('calls onRemove with the correct tag id when dismiss is clicked', () => {
        const onRemove = jest.fn();
        render(<TagView {...defaultProps} tags={[{ id: 'guid-abc', name: 'MyTag' }]} onRemove={onRemove} />);
        fireEvent.click(screen.getByLabelText('Remove MyTag'));
        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenCalledWith(expect.anything(), { value: 'guid-abc' });
    });

    it('renders the add record button', () => {
        render(<TagView {...defaultProps} />);
        expect(screen.getByLabelText('Add record')).toBeInTheDocument();
    });

    it('calls onOpen when the add button is clicked', () => {
        const onOpen = jest.fn();
        render(<TagView {...defaultProps} onOpen={onOpen} />);
        fireEvent.click(screen.getByLabelText('Add record'));
        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate with the tag id when tag name is clicked', () => {
        const onNavigate = jest.fn();
        render(<TagView {...defaultProps} tags={[{ id: 'guid-123', name: 'MyTag' }]} onNavigate={onNavigate} />);
        fireEvent.click(screen.getByText('MyTag'));
        expect(onNavigate).toHaveBeenCalledWith('guid-123');
    });

    it('shows a spinner when loading is true', () => {
        const { container } = render(<TagView {...defaultProps} loading={true} />);
        expect(container.querySelector('.ms-Spinner')).not.toBeNull();
    });

    it('does not show a spinner when loading is false', () => {
        const { container } = render(<TagView {...defaultProps} loading={false} />);
        expect(container.querySelector('.ms-Spinner')).toBeNull();
    });
});
