-- Smart Hotel Booking Engine - Triggers and Business Rules

-- Audit logging procedure
CREATE OR REPLACE PROCEDURE log_audit(
    p_table_name VARCHAR2,
    p_operation VARCHAR2,
    p_status VARCHAR2 DEFAULT 'SUCCESS'
)
IS
    PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    INSERT INTO AUDIT_LOG (audit_id, table_name, operation, user_name, status)
    VALUES (seq_audit_id.NEXTVAL, p_table_name, p_operation, USER, p_status);
    COMMIT;
END;
/

-- Compound trigger for RESERVATION with business rules
CREATE OR REPLACE TRIGGER trg_reservation_compound
FOR INSERT OR UPDATE OR DELETE ON RESERVATION
COMPOUND TRIGGER

    BEFORE EACH ROW IS
    BEGIN
        IF is_operation_restricted THEN
            log_audit('RESERVATION', 
                     CASE WHEN INSERTING THEN 'INSERT'
                          WHEN UPDATING THEN 'UPDATE'
                          ELSE 'DELETE' END, 'DENIED');
            
            RAISE_APPLICATION_ERROR(-20100, 
                'Operation denied: Cannot modify reservations on weekdays or holidays');
        END IF;
        
        log_audit('RESERVATION',
                 CASE WHEN INSERTING THEN 'INSERT'
                      WHEN UPDATING THEN 'UPDATE'
                      ELSE 'DELETE' END, 'ALLOWED');
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE ROOM SET status = 'RESERVED' WHERE room_id = :NEW.room_id;
        ELSIF UPDATING THEN
            IF :NEW.status = 'CHECKED_IN' THEN
                UPDATE ROOM SET status = 'OCCUPIED' WHERE room_id = :NEW.room_id;
            ELSIF :NEW.status IN ('CHECKED_OUT', 'CANCELLED') THEN
                UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = :NEW.room_id;
            END IF;
        ELSIF DELETING THEN
            UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = :OLD.room_id;
        END IF;
    END AFTER EACH ROW;

END trg_reservation_compound;
/

-- Trigger to prevent double booking
CREATE OR REPLACE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON RESERVATION
FOR EACH ROW
DECLARE
    v_conflict_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM RESERVATION
    WHERE room_id = :NEW.room_id
    AND status IN ('CONFIRMED', 'CHECKED_IN')
    AND reservation_id != NVL(:NEW.reservation_id, -1)
    AND NOT (check_out_date <= :NEW.check_in_date OR check_in_date >= :NEW.check_out_date);
    
    IF v_conflict_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20200, 'Double booking detected for room ' || :NEW.room_id);
    END IF;
END;
/

-- Simple audit trigger for PAYMENT
CREATE OR REPLACE TRIGGER trg_payment_audit
AFTER INSERT OR UPDATE OR DELETE ON PAYMENT
FOR EACH ROW
BEGIN
    log_audit('PAYMENT',
             CASE WHEN INSERTING THEN 'INSERT'
                  WHEN UPDATING THEN 'UPDATE'
                  ELSE 'DELETE' END);
END;
/