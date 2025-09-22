import React, { useState } from 'react';

interface CreateRiskGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => void;
}

const CreateRiskGroupModal: React.FC<CreateRiskGroupModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(name.trim(), description.trim());
            setName('');
            setDescription('');
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content create-group-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create Risk Group</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="create-group-form">
                    <div className="form-group">
                        <label className="form-label">Group Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter group name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter group description (optional)"
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <span className="form-hint">Optional description for the risk group</span>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? (
                                <>
                                    <div className="loading-spinner small"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Group'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRiskGroupModal;