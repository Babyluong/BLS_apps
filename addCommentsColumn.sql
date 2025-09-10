-- addCommentsColumn.sql
-- Add comments column to bls_results table

ALTER TABLE bls_results ADD COLUMN comments TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN bls_results.comments IS 'Detailed comments and analysis generated from checklist_results data';
